import { ref, onValue } from "firebase/database";
import { db } from "../../../lib/firebase";

const INVENTORY_PATH = "POS/Products/Inventory";

export function subscribeToIngredients(onChange, onError) {
  const inventoryRef = ref(db, INVENTORY_PATH);

  return onValue(
    inventoryRef,
    (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        onChange([]);
        return;
      }

      const ingredients = Object.entries(data)
        .filter(([, item]) => item?.ingredientName)
        .map(([id, item]) => ({
          id,
          name: item.ingredientName,
          unit: item.unit || "pcs",
          category: item.category || "",
          currentQuantity: Number(item.currentQuantity) || 0,
          parLevel: Number(item.parLevel) || 0,
        }));

      onChange(ingredients);
    },
    onError
  );
}