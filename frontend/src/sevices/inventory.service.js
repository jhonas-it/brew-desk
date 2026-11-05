import { onValue, push, ref } from "firebase/database"
import { db } from "../lib/firebase"

const wasteRef = ref(db, "Waste")
const ingredientRef = ref(db, "POS/Products/Inventory")
export const addWasteLog = async (ingredient, batch, quantityLost, reasonCode, isUnknown, note) => {
    await push(wasteRef, {
        ingredient: ingredient,
        batch: batch,
        quantityLost: quantityLost,
        reasonCode: reasonCode,
        isUnknown: isUnknown,
        note: note
    });
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