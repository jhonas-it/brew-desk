import { onValue, push, ref, update, remove } from "firebase/database"
import { db } from "../lib/firebase"

const wasteRef = ref(db, "Waste")
const ingredientRef = ref(db, "POS/Products/Inventory")
const reconciliationRef = ref(db, "Reconciliation");

export const addWasteLog = async (time, ingredient, batch, quantityLost, reasonCode, loggedBy, note, isUnknown) => {
    await push(wasteRef, {
        time: time,
        ingredient: ingredient,
        batch: batch,
        quantityLost: quantityLost,
        reasonCode: reasonCode,
        loggedBy: loggedBy,
        note: note,
        isUnknown: isUnknown,
    });
}

export const getWasteLog = (callback) => {
    onValue(wasteRef, (snapshot) => {
        const wasteLogArray = [];
        snapshot.forEach((snap) => {
            const wasteLogData = snap.val();
            wasteLogArray.push({
                id: snap.key,
                ...wasteLogData
            })
        })
        callback(wasteLogArray);
    })
}

export const addIngredient = async (ingredientName, category, unit, parLevel) => {
    await push(ingredientRef, {
        ingredientName: ingredientName,
        category: category,
        unit: unit,
        parLevel: parLevel
    });
}

export const getIngredients = (callback) => {
    onValue(ingredientRef, (snapshot) => {
        const ingredientArray = [];

        snapshot.forEach((snap) => {
            const ingredientData = snap.val();
            ingredientArray.push({
                id: snap.key,
                ...ingredientData
            })
        })
        callback(ingredientArray);
    })
}

export const updateIngredient = async (id, ingredientName, batchId) => {
    const ingredientItemRef = ref(db, `POS/Products/Inventory/${id}`)
    await update(ingredientItemRef, {
        ingredientName,
        batchId
    });
}

export const updateWasteLog = async (id, productName, batchId, reasonCode) => {
    const wasteLogItemRef = ref(db, `Waste/${id}`)
    await update(wasteLogItemRef, {
        ingredient: productName,
        batch: batchId,
        reasonCode: reasonCode
    });
}

export const removeWasteLog = async (id) => {
    const wasteLogItemRef = ref(db, `Waste/${id}`);
    await remove(wasteLogItemRef);
}

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
}

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
}

export const updateIngredientStock = async (id, currentQuantity) => {
    const ingredientItemRef = ref(db, `POS/Products/Inventory/${id}`);

    await update(ingredientItemRef, {
        currentQuantity
    });
}

export const addBatch = async (
    ingredientId,
    batchId,
    quantity,
    expirationDate,
    unit
) => {
    const batchRef = ref(
        db,
        `POS/Products/Inventory/${ingredientId}/batches`
    );

    const newBatch = {
        batchId,
        quantity: Number(quantity),
        expirationDate,
        receivedAt: new Date().toISOString(),
        unit
    };

    await push(batchRef, newBatch);
}