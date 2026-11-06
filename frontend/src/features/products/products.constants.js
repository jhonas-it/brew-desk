export const CATEGORIES = ["Coffee", "Non-Coffee", "Meal", "Pastry", "Dessert"];

export const DRINKS = ["Coffee", "Non-Coffee"];

export const SIZES = ["Small", "Medium", "Large"];

export const INGREDIENTS = [
  { id: "beans", name: "Espresso Beans", unit: "g" },
  { id: "milk", name: "Fresh Milk", unit: "ml" },
  { id: "water", name: "Water", unit: "ml" },
  { id: "ice", name: "Ice", unit: "g" },
  { id: "cup", name: "Cup & Lid", unit: "pcs" },
  { id: "base", name: "Flavor Base", unit: "g" },
  { id: "flour", name: "Flour", unit: "g" },
  { id: "butter", name: "Butter", unit: "g" },
  { id: "sugar", name: "Sugar", unit: "g" },
  { id: "cream", name: "Cream", unit: "ml" },
  { id: "pasta", name: "Pasta", unit: "g" },
  { id: "bread", name: "Bread", unit: "pcs" },
  { id: "cheese", name: "Cheese", unit: "g" },
  { id: "rice", name: "Rice", unit: "g" },
  { id: "egg", name: "Egg", unit: "pcs" },
  { id: "meat", name: "Meat / Protein", unit: "g" },
];

export const TABS = [
  ["All", "All"],
  ["Coffee", "Coffee"],
  ["Non-Coffee", "Non-Coffee"],
  ["Meal", "Meals"],
  ["Pastry", "Pastries"],
  ["Dessert", "Desserts"],
];

export const findIngredient = (list, id) =>
  list.find((item) => String(item.id) === String(id));

export const peso = (amount) =>
  `₱${Number(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
