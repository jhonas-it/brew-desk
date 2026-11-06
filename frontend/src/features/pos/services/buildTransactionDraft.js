
const toMoney = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Invalid monetary amount.");
  }

  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

export function buildTransactionDraft({
  items,
  orderType,
  breakdown,
  discountType,
  promoCode,
  paymentDetails,
}) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cannot create a transaction with an empty cart.");
  }

  if (!breakdown) {
    throw new Error("Checkout breakdown is missing.");
  }

  const total = toMoney(breakdown.total);
  const paymentMethod = paymentDetails?.paymentMethod;

  if (!["Cash", "GCash"].includes(paymentMethod)) {
    throw new Error("Invalid payment method.");
  }

  const amountTendered =
    paymentMethod === "Cash"
      ? toMoney(paymentDetails.amountTendered)
      : null;

  if (paymentMethod === "Cash" && amountTendered < total) {
    throw new Error("Insufficient cash payment.");
  }

  const transactionItems = items.map((item) => {
    const quantity = Number(item.quantity);
    const unitPrice = toMoney(item.unitPrice);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("Invalid product quantity.");
    }
    return {
      cartKey: item.key,

      // Firestore product and selected variant
      productId: item.productId,
      variantId: item.variantId,

      productName: item.name,
      variantName: item.variantName || null,

      quantity,
      unitPrice,
      lineTotal: toMoney(unitPrice * quantity),
    };
  });

  return {
    status: "draft",
    paymentStatus: "unverified",
    createdAt: new Date().toISOString(),

    orderType,
    items: transactionItems,

    discountType,
    promoCode: promoCode || null,

    totals: {
      subtotal: toMoney(breakdown.subtotal),
      promoDiscount: toMoney(breakdown.promoDiscount),
      vatExemptAmount: toMoney(breakdown.vatExemptAmount),
      statutoryDiscount: toMoney(breakdown.statutoryDiscount),
      total,
    },

    payment: {
      method: paymentMethod,
      amountTendered,
      change:
        paymentMethod === "Cash"
          ? toMoney(amountTendered - total)
          : null,
    },
  };
}
