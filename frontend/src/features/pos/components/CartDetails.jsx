import { useState } from "react";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  TicketPercent,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { usePOSCart } from "../store/usePOSCart";
import PaymentModal from "./PaymentModal";
import Discount from "./Discount";
import { calculateCheckout } from "./DiscountCalculator";
import "./CartDetails.css";
import ReceiptModal from "./ReceiptModal";
import { buildTransactionDraft } from "../services/buildTransactionDraft";
import { saveTransaction } from "../../sales/Transaction.service";
const formatPrice = (amount) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);

const blankBeneficiary = () => ({
  name: "",
  idNumber: "",
  verified: false,
});

export default function CartDetails({ user }) {
  const items = usePOSCart((state) => state.items);
  const changeQuantity = usePOSCart((state) => state.changeQuantity);
  const removeItem = usePOSCart((state) => state.removeItem);
  const clearCart = usePOSCart((state) => state.clearCart);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [savingTransaction, setSavingTransaction] = useState(false);

  const [orderType, setOrderType] = useState("Dine in");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [discountType, setDiscountType] = useState("none");
  const [beneficiary, setBeneficiary] = useState(blankBeneficiary);
  const [eligibleQuantities, setEligibleQuantities] = useState({});

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  const eligibleCount = items.reduce((total, item) => {
    const selected = Number(eligibleQuantities[item.key] || 0);
    return total + Math.max(0, Math.min(item.quantity, selected));
  }, 0);

  const isStatutoryReady =
    discountType !== "none" &&
    beneficiary.name.trim().length > 0 &&
    beneficiary.idNumber.trim().length > 0 &&
    beneficiary.verified &&
    eligibleCount > 0;

  // Preview only: 12% VAT-inclusive pricing is assumed for this demo.
  // Final checkout must recompute pricing, eligibility, and tax on the backend.
  const breakdown = calculateCheckout({
    items,
    promoCode: discountType === "none" ? appliedPromo : null,
    discountType: isStatutoryReady ? discountType : "none",
    eligibleQuantities,
    vatRegistered: true,
  });

  const {
    subtotal,
    promoDiscount,
    vatExemptAmount,
    statutoryDiscount,
    total: estimatedTotal,
  } = breakdown;

  function handleDiscountTypeChange(type) {
    setDiscountType(type);
    setAppliedPromo(null);
    setPromoInput("");
    setBeneficiary(blankBeneficiary());
    setEligibleQuantities({});
  }

  function applyPromo() {
    if (discountType !== "none") {
      toast.error("Remove the Senior/PWD selection before applying a promo.");
      return;
    }

    if (items.length === 0) {
      toast.error("Add products to the cart first.");
      return;
    }

    const code = promoInput.trim().toUpperCase();
    if (!code) {
      toast.error("Please enter a promo code.");
    } else if (code === "BREW5") {
      setAppliedPromo("BREW5");
      toast.success("Demo promo applied: 5% off.");
    } else {
      toast.error("Invalid promo code.");
    }
  }

  function handleClearCart() {
    clearCart();
    setPromoInput("");
    setAppliedPromo(null);
    setDiscountType("none");
    setBeneficiary(blankBeneficiary());
    setEligibleQuantities({});
    setShowClearDialog(false);
    setShowPaymentModal(false);
    toast.success("Cart cleared successfully.");
  }

  function handleRemoveItem(key) {
    removeItem(key);
    setEligibleQuantities((previous) => {
      const next = { ...previous };
      delete next[key];
      return next;
    });
    toast.info("Product removed from cart.");
  }


  async function handleCompleteTransaction() {
    if (!receiptPreview?.transactionDraft || savingTransaction) return;
    if (!user?.uid) {
      toast.error("Cashier information is still loading. Please try again.");
      return;
    }
    
    setSavingTransaction(true);

    try {
      const draft = receiptPreview.transactionDraft;

      // GCash cannot be marked as paid without verification.
      if (draft.payment.method !== "Cash") {
        toast.error("GCash payment verification is not available yet.");
        return;
      }

      const now = new Date();

      const datePart = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
      ].join("");

      const receiptId = `RCP-${datePart}-${crypto.randomUUID()
        .slice(0, 8)
        .toUpperCase()}`;

      const completedTransaction = {
        ...draft,
        receiptId,
        cashierId: user?.uid || null,
        cashierName: user?.name || "Unknown",
        cashierRole: user?.role || "cashier",
        status: "completed",
        paymentStatus: "paid",
        createdAt: now.toISOString(),
      };

      await saveTransaction(completedTransaction);

      // Clear the cart only after Firestore confirms the save.
      clearCart();
      setReceiptPreview(null);
      setOrderType("Dine in");
      setPromoInput("");
      setAppliedPromo(null);
      setDiscountType("none");
      setBeneficiary(blankBeneficiary());
      setEligibleQuantities({});

      toast.success("Transaction saved successfully!");
    } catch (error) {
      console.error("Transaction save failed:", error);
      toast.error(error.message || "Unable to save transaction.");
    } finally {
      setSavingTransaction(false);
    }
  }


  return (
    <aside className="bd-cart-panel">
      <div className="bd-cart-top">
        <div className="bd-cart-title-group">
          <h2>Cart Details</h2>
          <span className="bd-cart-item-count">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </div>
        <button
          type="button"
          className="bd-cart-clear"
          disabled={items.length === 0}
          onClick={() => setShowClearDialog(true)}
        >
          Clear all
        </button>
      </div>

      <div className="bd-cart-order-type">
        {["Dine in", "Takeaway"].map((type) => (
          <button
            key={type}
            type="button"
            className={orderType === type ? "bd-cart-type-selected" : ""}
            onClick={() => setOrderType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="bd-cart-items">
        {items.length === 0 ? (
          <div className="bd-cart-empty">
            <ShoppingCart size={35} strokeWidth={1.5} />
            <p>Your cart is empty</p>
            <span>Add products to start an order.</span>
          </div>
        ) : (
          items.map((item) => (
            <div className="bd-cart-product" key={item.key}>
              <div className="bd-cart-product-info">
                <h3>{item.name}</h3>
                <p>{item.variantName ? `Variant: ${item.variantName}` : "Regular"}</p>
                <strong>{formatPrice(item.unitPrice * item.quantity)}</strong>
              </div>
              <div className="bd-cart-product-actions">
                <div className="bd-cart-quantity">
                  <button
                    type="button"
                    onClick={() => changeQuantity(item.key, -1)}
                    aria-label={`Decrease ${item.name} quantity`}
                  >
                    <Minus size={12} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => changeQuantity(item.key, 1)}
                    aria-label={`Increase ${item.name} quantity`}
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <button
                  type="button"
                  className="bd-cart-delete"
                  onClick={() => handleRemoveItem(item.key)}
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bd-cart-bottom">
        <div className="bd-cart-promo">
          <input
            type="text"
            value={promoInput}
            onChange={(event) => setPromoInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") applyPromo();
            }}
            placeholder="ENTER PROMO CODE (E.G. BREW5)"
            aria-label="Promo code"
            disabled={discountType !== "none"}
          />
          <button type="button" onClick={applyPromo} disabled={discountType !== "none"}>
            Apply
          </button>
        </div>

        {appliedPromo && discountType === "none" && (
          <div className="bd-cart-applied-promo">
            <TicketPercent size={13} />
            <span>{appliedPromo} applied</span>
            <button
              type="button"
              onClick={() => {
                setAppliedPromo(null);
                setPromoInput("");
              }}
            >
              Remove
            </button>
          </div>
        )}

        <Discount
          items={items}
          discountType={discountType}
          onDiscountTypeChange={handleDiscountTypeChange}
          beneficiary={beneficiary}
          onBeneficiaryChange={setBeneficiary}
          eligibleQuantities={eligibleQuantities}
          onEligibleQuantityChange={(key, quantity) =>
            setEligibleQuantities((previous) => ({ ...previous, [key]: quantity }))
          }
        />

        {discountType !== "none" && !isStatutoryReady && (
          <p className="mt-2 text-[10px] text-amber-700">
            Enter the beneficiary details, select eligible quantities, and confirm
            the ID check to preview the discount.
          </p>
        )}

        <div className="bd-cart-summary">
          <div>
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <div>
            <span>Promo discount</span>
            <strong className="bd-cart-discount">-{formatPrice(promoDiscount)}</strong>
          </div>
          {discountType !== "none" && (
            <>
              <div>
                <span>VAT exemption</span>
                <strong className="bd-cart-discount">
                  -{formatPrice(vatExemptAmount)}
                </strong>
              </div>
              <div>
                <span>{discountType === "senior" ? "Senior" : "PWD"} 20% discount</span>
                <strong className="bd-cart-discount">
                  -{formatPrice(statutoryDiscount)}
                </strong>
              </div>
            </>
          )}
          <div className="bd-cart-total-row">
            <strong>Estimated total</strong>
            <strong>{formatPrice(estimatedTotal)}</strong>
          </div>
        </div>

        <p className="bd-cart-tax-note">
          Preview only. Final VAT and statutory discounts must be validated at checkout.
        </p>

        <button
          type="button"
          className="bd-cart-pay"
          disabled={items.length === 0 || (discountType !== "none" && !isStatutoryReady)}
          onClick={() => setShowPaymentModal(true)}
        >
          Proceed payment
          <ArrowRight size={16} />
        </button>
      </div>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear shopping cart?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all products from the current order. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearCart}
              className="bg-[#F4511E] hover:bg-[#D94313]"
            >
              Clear Cart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        items={items}
        orderType={orderType}
        estimatedTotal={estimatedTotal}
        breakdown={breakdown}
        discountType={isStatutoryReady ? discountType : "none"}


        onPreviewReceipt={(paymentDetails) => {
          try {
            const selectedDiscountType = isStatutoryReady
              ? discountType
              : "none";

            // Prepare the transaction locally.
            // This does NOT save anything to Firebase.
            const transactionDraft = buildTransactionDraft({
              items,
              orderType,
              breakdown,
              discountType: selectedDiscountType,
              promoCode:
                discountType === "none" ? appliedPromo : null,
              paymentDetails,
            });

            // Keep the existing receipt preview structure.
            const receiptData = {
              items: items.map((item) => ({ ...item })),
              orderType,
              breakdown: { ...breakdown },
              discountType: selectedDiscountType,
              paymentMethod: paymentDetails.paymentMethod,
              amountTendered: paymentDetails.amountTendered,
              previewedAt: new Date().toISOString(),

              // Prepared for future Firestore integration.
              transactionDraft,
            };

            console.log(
              "Brew Desk transaction draft (NOT SAVED):",
              transactionDraft
            );

            setReceiptPreview(receiptData);

            return true;
          } catch (error) {
            toast.error(
              error.message || "Unable to prepare transaction."
            );

            return false;
          }
        }}

      />
      <ReceiptModal
        open={Boolean(receiptPreview)}
        onClose={() => {
          if (!savingTransaction) {
            setReceiptPreview(null);
          }
        }}
        data={receiptPreview}
        onComplete={handleCompleteTransaction}
        saving={savingTransaction}
      />
    </aside>
  );
}