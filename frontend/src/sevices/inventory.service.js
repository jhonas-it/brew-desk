import {
    onValue,
    push,
    ref,
    update,
    remove,
    runTransaction
} from "firebase/database";

import { db } from "../lib/firebase";

const wasteRef = ref(db, "Waste");
const ingredientRef = ref(db, "POS/Products/Inventory");
const reconciliationRef = ref(db, "Reconciliation");
const batchCounterRef = ref(db, "POS/Products/BatchCounter");

// WASTE LOG

export const addWasteLog = async (
    time,
    ingredient,
    batch,
    quantityLost,
    reasonCode,
    loggedBy,
    note,
    isUnknown
) => {
    await push(wasteRef, {
        time,
        ingredient,
        batch,
        quantityLost,
        reasonCode,
        loggedBy,
        note,
        isUnknown
    });
};

export const getWasteLog = (callback) => {
    onValue(wasteRef, (snapshot) => {
        const wasteLogArray = [];

        snapshot.forEach((snap) => {
            const wasteLogData = snap.val();

            wasteLogArray.push({
                id: snap.key,
                ...wasteLogData
            });
        });

        callback(wasteLogArray);
    });
};

export const updateWasteLog = async (
    id,
    productName,
    batchId,
    reasonCode
) => {
    const wasteLogItemRef = ref(db, `Waste/${id}`);

    await update(wasteLogItemRef, {
        ingredient: productName,
        batch: batchId,
        reasonCode
    });
};

export const removeWasteLog = async (id) => {
    const wasteLogItemRef = ref(db, `Waste/${id}`);

    await remove(wasteLogItemRef);
};

// INGREDIENTS

export const addIngredient = async (
    ingredientName,
    category,
    unit,
    parLevel
) => {
    await push(ingredientRef, {
        ingredientName,
        category,
        unit,
        parLevel: Number(parLevel),
        currentQuantity: 0
    });
};

export const getIngredients = (callback) => {
    onValue(ingredientRef, (snapshot) => {
        const ingredientArray = [];

        snapshot.forEach((snap) => {
            const ingredientData = snap.val();

            ingredientArray.push({
                id: snap.key,
                ...ingredientData
            });
        });

        callback(ingredientArray);
    });
};

export const updateIngredient = async (
    id,
    ingredientName,
    batchId
) => {
    const ingredientItemRef = ref(
        db,
        `POS/Products/Inventory/${id}`
    );

    await update(ingredientItemRef, {
        ingredientName,
        batchId
    });
};

export const updateIngredientStock = async (
    id,
    currentQuantity
) => {
    const ingredientItemRef = ref(
        db,
        `POS/Products/Inventory/${id}`
    );

    await update(ingredientItemRef, {
        currentQuantity
    });
};

// BATCHES

export const addBatch = async (
    ingredientId,
    quantity,
    expirationDate,
    unit
) => {
    const numericQuantity = Number(quantity);

    if (!ingredientId || !Number.isFinite(numericQuantity) || numericQuantity <= 0) {
        throw new Error("Please select an ingredient and enter a valid quantity.");
    }

    // Generate the next sequential batch number.
    const counterResult = await runTransaction(
        batchCounterRef,
        (currentCounter) => {
            return (Number(currentCounter) || 0) + 1;
        }
    );

    if (!counterResult.committed) {
        throw new Error("Could not generate a batch ID.");
    }

    const batchNumber = counterResult.snapshot.val();
    const batchId = `#WM-${String(batchNumber).padStart(3, "0")}`;

    const ingredientItemRef = ref(
        db,
        `POS/Products/Inventory/${ingredientId}`
    );

    // Generate a unique Firebase key for this batch.
    const batchKey = push(
        ref(db, `POS/Products/Inventory/${ingredientId}/batches`)
    ).key;

    const batchData = {
        batchId,
        quantity: numericQuantity,
        expirationDate,
        receivedAt: new Date().toISOString(),
        unit
    };

    // Save the batch and increment the ingredient's total stock.
    const result = await runTransaction(
        ingredientItemRef,
        (currentIngredient) => {
            if (currentIngredient === null) {
                return;
            }

            const currentQuantity =
                Number(currentIngredient.currentQuantity) || 0;

            return {
                ...currentIngredient,
                currentQuantity: currentQuantity + numericQuantity,
                batches: {
                    ...(currentIngredient.batches || {}),
                    [batchKey]: batchData
                }
            };
        }
    );

    if (!result.committed) {
        throw new Error("Could not save the batch. Ingredient may no longer exist.");
    }

    return batchId;
};

export const getBatches = (ingredientId, callback) => {
    const batchRef = ref(
        db,
        `POS/Products/Inventory/${ingredientId}/batches`
    );

    return onValue(batchRef, (snapshot) => {
        const batchArray = [];

        snapshot.forEach((snap) => {
            const batchData = snap.val();

            batchArray.push({
                id: snap.key,
                ...batchData
            });
        });

        callback(batchArray);
    });
}

// STOCK RECONCILIATION

export const addReconciliation = async (
    date,
    ingredientId,
    ingredient,
    systemExpected,
    physicalCount,
    discrepancy,
    auditor,
    unit
) => {
    await push(reconciliationRef, {
        date,
        ingredientId,
        ingredient,
        systemExpected,
        physicalCount,
        discrepancy,
        auditor,
        unit
    });
};

export const getReconciliation = (callback) => {
    onValue(reconciliationRef, (snapshot) => {
        const reconciliationArray = [];

        snapshot.forEach((snap) => {
            const reconciliationData = snap.val();

            reconciliationArray.push({
                id: snap.key,
                ...reconciliationData
            });
        });

        callback(reconciliationArray);
    });
};
