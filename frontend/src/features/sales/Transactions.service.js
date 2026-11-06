
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "../../lib/firebase";

const transactionsCollection = collection(db, "transactions");

export function subscribeToTransactions(onData, onError) {
  const q = query(
    transactionsCollection,
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const transactions = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      onData(transactions);
    },
    onError
  );
}

// For the POS checkout integration in the next step.
// Only finalized, verified transactions should be saved.
export async function saveTransaction(transaction) {
  if (
    transaction?.status !== "completed" ||
    transaction?.paymentStatus !== "paid"
  ) {
    throw new Error(
      "Only verified, completed transactions can be recorded."
    );
  }

  if (!Array.isArray(transaction.items) ||
      transaction.items.length === 0) {
    throw new Error("A transaction must contain products.");
  }

  return addDoc(transactionsCollection, transaction);
}