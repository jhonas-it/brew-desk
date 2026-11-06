
import { useState } from "react";
import { Banknote, Smartphone, Wallet } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import "./PaymentModal.css";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);

export default function PaymentModal({
  open,
  onClose,
  items,
  orderType,
  estimatedTotal,
  breakdown,
  discountType,
  onPreviewReceipt,
}) {
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [amountTendered, setAmountTendered] = useState("");

  const tendered = Number(amountTendered) || 0;
  const change = Math.max(0, tendered - estimatedTotal);
  const isEnoughCash = tendered >= estimatedTotal;

  function handleClose() {
    setPaymentMethod("Cash");
    setAmountTendered("");
    onClose();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogContent className="bd-payment-dialog">
        <DialogHeader>
          <DialogTitle className="bd-payment-title">
            Proceed Payment
          </DialogTitle>
          <DialogDescription>
            Review the order and select a payment method.
          </DialogDescription>
        </DialogHeader>

        <div className="bd-payment-order">
          <div className="bd-payment-order-header">
            <span>Order Summary</span>
            <span>{orderType}</span>
          </div>

          <div className="bd-payment-order-items">
            {items.map((item) => (
              <div key={item.key}>
                <span>
                  {item.quantity}× {item.name}
                  {item.variantName &&
                    ` (${item.variantName})`}
                </span>
                <strong>
                  {formatPrice(
                    item.unitPrice * item.quantity
                  )}
                </strong>
              </div>
            ))}
          </div>

          <div className="bd-payment-total">
            <span>Estimated Total</span>
            <strong>{formatPrice(estimatedTotal)}</strong>
          </div>
        </div>

        <div className="bd-payment-methods">
          <p>Payment Method</p>

          <div className="bd-payment-options">
            <button
              type="button"
              className={
                paymentMethod === "Cash" ? "selected" : ""
              }
              onClick={() => setPaymentMethod("Cash")}
            >
              <Banknote size={22} />
              Cash
            </button>

            <button
              type="button"
              className={
                paymentMethod === "GCash" ? "selected" : ""
              }
              onClick={() => setPaymentMethod("GCash")}
            >
              <Smartphone size={22} />
              GCash
            </button>
          </div>
        </div>

        {paymentMethod === "Cash" ? (
          <div className="bd-payment-cash">
            <label htmlFor="amountTendered">
              Amount Tendered
            </label>

            <div className="bd-payment-input">
              <span>₱</span>
              <input
                id="amountTendered"
                type="number"
                min="0"
                step="0.01"
                value={amountTendered}
                onChange={(event) =>
                  setAmountTendered(event.target.value)
                }
                placeholder="0.00"
              />
            </div>

            <div className="bd-payment-change">
              <span>Change</span>
              <strong>{formatPrice(change)}</strong>
            </div>

            {amountTendered !== "" && !isEnoughCash && (
              <p className="bd-payment-error">
                Insufficient payment amount.
              </p>
            )}
          </div>
        ) : (
          <div className="bd-payment-gcash">
            <Wallet size={25} />
            <p>GCash Payment</p>
            <span>
              GCash payment confirmation will be connected
              to the backend later.
            </span>
          </div>
        )}

        <div className="bd-payment-actions">
          <button
            type="button"
            className="bd-payment-cancel"
            onClick={handleClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="bd-payment-confirm"
            disabled={
              paymentMethod === "Cash" && !isEnoughCash
            }

            onClick={() => {
              const previewDetails = {
                paymentMethod,
                amountTendered:
                  paymentMethod === "Cash" ? tendered : 0,
              };

              const isValid = onPreviewReceipt(previewDetails);

              if (isValid) {
                handleClose();
              }
            }}

          >
            Preview Receipt
          </button>
        </div>

        <p className="bd-payment-demo-note">
          Preview only. Final VAT, statutory discounts,
          and payment verification are not implemented yet.
        </p>
      </DialogContent>
    </Dialog>
  );
}
