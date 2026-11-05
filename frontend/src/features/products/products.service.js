import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

import { firestore, db } from "../../../lib/firebase";

const PRODUCTS_COLLECTION = "products";

// Get all products
export async function getProducts() {
  const snapshot = await getDocs(
    collection(firestore, PRODUCTS_COLLECTION)
  );

  return snapshot.docs.map((item) => ({
    ...item.data(),
    id: item.id,
  }));
}

// Listen for product changes in real time
export function subscribeToProducts(onChange, onError) {
  return onSnapshot(
    collection(firestore, PRODUCTS_COLLECTION),
    (snapshot) => {
      const products = snapshot.docs.map((item) => ({
        ...item.data(),
        id: item.id,
      }));

      onChange(products);
    },
    onError
  );
}

// Add a product
export async function addProduct(product) {
  const { id, ...productData } = product;

  const result = await addDoc(
    collection(firestore, PRODUCTS_COLLECTION),
    {
      ...productData,
      active: true,
      createdAt: new Date().toISOString(),
    }
  );

  return {
    ...productData,
    id: result.id,
    active: true,
  };
}

// Update a product
export async function updateProduct(id, changes) {
  const { id: ignoredId, ...data } = changes;

  await updateDoc(
    doc(firestore, PRODUCTS_COLLECTION, id),
    data
  );

  return { ...data, id };
}