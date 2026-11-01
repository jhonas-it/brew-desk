import { push, ref } from "firebase/database"
import { db } from "../lib/firebase"

const wasteRef = ref(db, "Waste")

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