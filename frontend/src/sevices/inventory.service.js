import { onValue, push, ref } from "firebase/database"
import { db } from "../lib/firebase"

const wasteRef = ref(db, "Waste")
const ingredientRef = ref(db, "POS/Products/Inventory")
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