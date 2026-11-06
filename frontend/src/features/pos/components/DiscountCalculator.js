
const roundMoney = (value) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateCheckout({
  items = [],
  promoCode = null,
  discountType = "none",
  eligibleQuantities = {},
  vatRegistered = true,
}) {
  const subtotal = roundMoney(
    items.reduce(
      (sum, item) =>
        sum + item.unitPrice * item.quantity,
      0
    )
  );

  const hasStatutoryDiscount =
    discountType === "senior" || discountType === "pwd";

  // Only count quantities belonging to the eligible customer.
  const eligibleGross = roundMoney(
    items.reduce((sum, item) => {
      const selected = Number(
        eligibleQuantities[item.key] || 0
      );

      const eligibleQuantity = Math.max(
        0,
        Math.min(item.quantity, selected)
      );

      return (
        sum + eligibleQuantity * item.unitPrice
      );
    }, 0)
  );

  // Assumes prices already include 12% VAT.
  const vatExemptAmount =
    hasStatutoryDiscount && vatRegistered
      ? roundMoney(eligibleGross - eligibleGross / 1.12)
      : 0;

  const eligibleNet = roundMoney(
    eligibleGross - vatExemptAmount
  );

  const statutoryDiscount = hasStatutoryDiscount
    ? roundMoney(eligibleNet * 0.2)
    : 0;

  // Demo promo does not stack with statutory discounts.
  const promoDiscount =
    !hasStatutoryDiscount && promoCode === "BREW5"
      ? roundMoney(subtotal * 0.05)
      : 0;

  const total = Math.max(
    0,
    roundMoney(
      subtotal -
      vatExemptAmount -
      statutoryDiscount -
      promoDiscount
    )
  );

  return {
    subtotal,
    eligibleGross,
    vatExemptAmount,
    statutoryDiscount,
    promoDiscount,
    total,
  };
}
