
import {
    doc,
    getDoc,
    runTransaction as runFirestoreTransaction,
    updateDoc,
} from "firebase/firestore";

import {
    ref,
    onValue,
    runTransaction as runDatabaseTransaction,
} from "firebase/database";

import { db, rtdb } from "../../../lib/firebase";

const round6 = (n) =>
    Math.round((n + Number.EPSILON) * 1e6) / 1e6;

const round2 = (n) =>
    Math.round((n + Number.EPSILON) * 100) / 100;

const validKey = (key) =>
    typeof key === "string" &&
    /^[A-Za-z0-9_-]{1,128}$/.test(key);

const getTodayPH = () => {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const value = (type) =>
        parts.find((p) => p.type === type)?.value;

    return `${value("year")}-${value("month")}-${value("day")}`;
};

export function generateCheckoutId() {
    return crypto.randomUUID();
}

// STEP 1: VALIDATE PRODUCTS AND RECIPES

async function prepareRequirements(items) {
    if (
        !Array.isArray(items) ||
        items.length === 0 ||
        items.length > 100
    ) {
        throw new Error("Invalid or empty checkout cart.");
    }

    const requirements = new Map();

    for (const item of items) {
        const quantity = Number(item.quantity);

        if (
            !validKey(item.productId) ||
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            quantity > 1000
        ) {
            throw new Error("Invalid product or quantity.");
        }

        const snap = await getDoc(
            doc(db, "products", item.productId)
        );

        if (!snap.exists()) {
            throw new Error("Product no longer exists.");
        }

        const product = snap.data();

        if (
            product.active !== true ||
            product.showOnPos === false
        ) {
            throw new Error(
                `${product.name || "Product"} is unavailable.`
            );
        }

        const sizes = Array.isArray(product.sizes)
            ? product.sizes
            : [];

        const matchedSize = sizes.find(
            (s) =>
                String(s).toLowerCase() ===
                String(item.variantId || "").toLowerCase()
        );

        if (sizes.length && !matchedSize) {
            throw new Error(`Invalid size for ${product.name}.`);
        }

        const actualPrice = Number(
            sizes.length
                ? product.sizePrices?.[matchedSize]
                : product.price
        );

        if (
            !Number.isFinite(actualPrice) ||
            actualPrice <= 0
        ) {
            throw new Error(`Invalid price for ${product.name}.`);
        }

        if (
            round2(actualPrice) !==
            round2(Number(item.unitPrice))
        ) {
            throw new Error(
                `${product.name} price changed. Refresh the cart.`
            );
        }

        const recipe = sizes.length
            ? product.recipesBySize?.[matchedSize]
            : product.recipe;

        if (!Array.isArray(recipe) || !recipe.length) {
            throw new Error(`${product.name} has no recipe.`);
        }

        for (const part of recipe) {
            const ingredientId = part?.ingredientId;
            const needed = Number(part?.qty) * quantity;

            if (
                !validKey(ingredientId) ||
                !Number.isFinite(needed) ||
                needed <= 0
            ) {
                throw new Error(
                    `Invalid ingredient recipe for ${product.name}.`
                );
            }

            requirements.set(
                ingredientId,
                round6(
                    (requirements.get(ingredientId) || 0) + needed
                )
            );
        }
    }

    return Object.fromEntries(
        [...requirements].sort(([a], [b]) =>
            a.localeCompare(b)
        )
    );
}

// STEP 2: LOAD RTDB DATA BEFORE TRANSACTION
// Keep the listener active until deduction finishes.

function waitForInventory(inventoryRef) {
    let unsubscribe = () => { };

    const ready = new Promise((resolve, reject) => {
        unsubscribe = onValue(
            inventoryRef,
            (snapshot) => {
                resolve(snapshot);
            },
            (error) => {
                reject(error);
            },
            { onlyOnce: false }
        );
    });

    return {
        ready,
        stop: () => unsubscribe(),
    };
}

// STEP 3: ATOMIC FEFO INVENTORY DEDUCTION

async function deductInventory({
    checkoutId,
    signature,
    requirements,
}) {
    const inventoryRef = ref(rtdb, "POS/Products");
    const today = getTodayPH();

    console.log("CHECKOUT STEP 3: Deducting inventory");
    console.log("Required ingredients:", requirements);

    const listener = waitForInventory(inventoryRef);

    try {
        const snapshot = await listener.ready;

        if (!snapshot.hasChild("Inventory")) {
            throw new Error(
                "Inventory was not found at POS/Products/Inventory."
            );
        }

        console.log("RTDB inventory loaded successfully.");

        let abortReason = "";

        const result = await runDatabaseTransaction(
            inventoryRef,
            (data) => {
                abortReason = "";

                const fail = (message) => {
                    abortReason = message;
                    return;
                };

                // RTDB can initially supply null.
                // Never overwrite missing data with a new inventory.
                if (!data?.Inventory) {
                    return fail(
                        "Transaction received no inventory data. Retry only after checking the sale status."
                    );
                }

                const previous =
                    data.CheckoutDeductions?.[checkoutId];

                if (previous) {
                    if (
                        previous.signature !== signature ||
                        previous.status !== "deducted"
                    ) {
                        return fail(
                            "Checkout deduction record mismatch. Manual review required."
                        );
                    }

                    // Already deducted. Do not deduct again.
                    console.log("Existing deduction found.");
                    return;
                }

                const next = structuredClone(data);

                for (const [ingredientId, required] of
                    Object.entries(requirements)) {

                    const ingredient =
                        next.Inventory?.[ingredientId];

                    if (!ingredient) {
                        return fail(
                            `Ingredient ${ingredientId} not found.`
                        );
                    }

                    const current = Number(
                        ingredient.currentQuantity
                    );

                    if (
                        !Number.isFinite(current) ||
                        current < 0 ||
                        current + 1e-7 < required
                    ) {
                        return fail(
                            `Insufficient stock for ${ingredient.ingredientName || ingredientId}. Required: ${required}, Available: ${current}`
                        );
                    }

                    const batches = Object.entries(
                        ingredient.batches || {}
                    )
                        .filter(([, batch]) =>
                            batch &&
                            typeof batch.expirationDate === "string" &&
                            /^\d{4}-\d{2}-\d{2}$/.test(
                                batch.expirationDate
                            ) &&
                            batch.expirationDate >= today &&
                            Number.isFinite(Number(batch.quantity)) &&
                            Number(batch.quantity) > 0
                        )
                        .sort((a, b) =>
                            a[1].expirationDate.localeCompare(
                                b[1].expirationDate
                            )
                        );

                    const available = batches.reduce(
                        (sum, [, batch]) =>
                            sum + Number(batch.quantity),
                        0
                    );

                    if (available + 1e-7 < required) {
                        return fail(
                            `Insufficient unexpired batches for ${ingredient.ingredientName || ingredientId}. Required: ${required}, Available: ${available}`
                        );
                    }

                    let remaining = required;

                    for (const [batchKey, batch] of batches) {
                        if (remaining <= 1e-7) break;

                        const taken = Math.min(
                            remaining,
                            Number(batch.quantity)
                        );

                        ingredient.batches[batchKey].quantity =
                            round6(Number(batch.quantity) - taken);

                        remaining = round6(remaining - taken);
                    }

                    if (remaining > 1e-7) {
                        return fail(
                            `Incomplete deduction for ${ingredientId}.`
                        );
                    }

                    ingredient.currentQuantity = round6(
                        current - required
                    );
                }

                next.CheckoutDeductions ||= {};

                next.CheckoutDeductions[checkoutId] = {
                    status: "deducted",
                    signature,
                    ingredients: requirements,
                    createdAt: new Date().toISOString(),
                };

                return next;
            },
            { applyLocally: false }
        );

        if (!result.committed) {
            const previous = result.snapshot
                .child(`CheckoutDeductions/${checkoutId}`)
                .val();

            if (
                previous?.status === "deducted" &&
                previous.signature === signature
            ) {
                console.log(
                    "Deduction already exists. No second deduction needed."
                );
                return;
            }

            throw new Error(
                abortReason ||
                "Inventory deduction was not committed."
            );
        }

        console.log("CHECKOUT STEP 3 SUCCESS");
    } finally {
        listener.stop();
    }
}

// STEP 4: COMPLETE POS CHECKOUT

export async function completePOSCheckout({
    checkoutId,
    items,
    transactionDraft,
    cashier,
}) {
    if (!validKey(checkoutId) || checkoutId.length < 8) {
        throw new Error("Invalid checkout ID.");
    }

    if (!cashier?.uid) {
        throw new Error("Cashier is not signed in.");
    }

    if (transactionDraft?.payment?.method !== "Cash") {
        throw new Error("Only cash checkout is available.");
    }

    if (
        !Array.isArray(transactionDraft?.items) ||
        !transactionDraft.items.length
    ) {
        throw new Error("Missing sale items.");
    }

    const total = Number(transactionDraft.totals?.total);
    const tendered = Number(
        transactionDraft.payment?.amountTendered
    );

    if (
        !Number.isFinite(total) ||
        total < 0 ||
        !Number.isFinite(tendered) ||
        tendered < total
    ) {
        throw new Error("Insufficient or invalid payment.");
    }

    const receiptId = `RCP-${getTodayPH().replaceAll("-", "")}-${checkoutId.slice(0, 8).toUpperCase()}`;
    const saleRef = doc(db, "transactions", checkoutId);

    const signature = JSON.stringify({
        cashierId: cashier.uid,
        items: items.map((i) => [
            i.productId,
            i.variantId || "regular",
            i.quantity,
            i.unitPrice,
        ]),
        totals: transactionDraft.totals,
        payment: transactionDraft.payment,
        discountType: transactionDraft.discountType,
        promoCode: transactionDraft.promoCode,
    });

    let existingData;

    console.log("CHECKOUT STEP 1: Firestore transaction");

    await runFirestoreTransaction(db, async (tx) => {
        const existing = await tx.get(saleRef);

        if (existing.exists()) {
            existingData = existing.data();

            if (
                existingData.cashierId !== cashier.uid ||
                existingData.checkoutSignature !== signature
            ) {
                throw new Error(
                    "Checkout ID belongs to another transaction."
                );
            }

            return;
        }

        tx.set(saleRef, {
            ...transactionDraft,
            checkoutId,
            receiptId,
            checkoutSignature: signature,
            cashierId: cashier.uid,
            cashierName: cashier.name || "Cashier",
            cashierRole: cashier.role || "cashier",
            status: "processing",
            paymentStatus: "unverified",
            createdAt: new Date().toISOString(),
        });
    });

    if (existingData?.status === "completed") {
        return {
            status: "completed",
            receiptId: existingData.receiptId || receiptId,
            alreadyCompleted: true,
        };
    }
    let requirements;

    if (existingData) {
        requirements = existingData.ingredientRequirements;

        if (
            !requirements ||
            !Object.keys(requirements).length
        ) {
            throw new Error(
                "Pending sale has no ingredient requirements. Manual review required."
            );
        }
    } else {
        requirements = await prepareRequirements(items);

        console.log(
            "CHECKOUT STEP 2: Saving ingredient requirements"
        );

        await updateDoc(saleRef, {
            ingredientRequirements: requirements,
        });
    }

    await deductInventory({
        checkoutId,
        signature,
        requirements,
    });

    console.log(
        "CHECKOUT STEP 4: Finalizing Firestore sale"
    );

    await updateDoc(saleRef, {
        status: "completed",
        paymentStatus: "paid",
        completedAt: new Date().toISOString(),
    });

    console.log("CHECKOUT COMPLETED:", receiptId);

    return {
        status: "completed",
        receiptId: existingData?.receiptId || receiptId,
        alreadyCompleted: Boolean(existingData),
    };
}
