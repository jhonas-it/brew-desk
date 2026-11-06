
import { Printer, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import "./ReceiptModal.css";

const money = (value = 0) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(value) || 0);

export default function ReceiptModal({
  open,
  onClose,
  data,
  onComplete,
  saving = false,
}) {
  if (!data) return null;

  const {
    items = [],
    orderType = "Dine in",
    paymentMethod = "Cash",
    amountTendered = 0,
    breakdown = {},
    discountType = "none",
    previewedAt,
  } = data;

  const subtotal = Number(breakdown.subtotal || 0);
  const promoDiscount = Number(breakdown.promoDiscount || 0);
  const vatExemptAmount = Number(
    breakdown.vatExemptAmount || 0
  );
  const statutoryDiscount = Number(
    breakdown.statutoryDiscount || 0
  );

  const total = Number(breakdown.total || 0);
  const tendered = Number(amountTendered || 0);
  const change = Math.max(0, tendered - total);

  const date = new Date(previewedAt || Date.now());

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value && !saving) onClose();
      }}
    >
      <DialogContent className="bd-receipt-dialog">
        <DialogHeader className="bd-receipt-screen-header">
          <DialogTitle>Receipt Preview</DialogTitle>
          <DialogDescription>
            This is a sample receipt. No payment or sale
            has been recorded.
          </DialogDescription>
        </DialogHeader>

        <div className="bd-receipt-paper">
          <div className="bd-receipt-brand">
            <h2>BREW DESK</h2>
            <p>Payment Receipt Preview</p>
            <strong>DEMO — NOT PROOF OF PAYMENT</strong>
          </div>

          <div className="bd-receipt-divider" />

          <div className="bd-receipt-row">
            <span>Reference</span>
            <span>DEMO ONLY</span>
          </div>

          <div className="bd-receipt-row">
            <span>Preview date</span>
            <span>
              {date.toLocaleString("en-PH", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>

          <div className="bd-receipt-row">
            <span>Order type</span>
            <span>{orderType}</span>
          </div>

          <div className="bd-receipt-divider" />

          <p className="bd-receipt-section-title">
            ORDER ITEMS
          </p>

          <div className="bd-receipt-products">
            {items.map((item) => (
              <div
                className="bd-receipt-product"
                key={item.key}
              >
                <div>
                  <strong>
                    {item.quantity}× {item.name}
                  </strong>
                  {item.variantName && (
                    <span>{item.variantName}</span>
                  )}
                  <span>
                    {money(item.unitPrice)} each
                  </span>
                </div>

                <strong>
                  {money(item.quantity * item.unitPrice)}
                </strong>
              </div>
            ))}
          </div>

          <div className="bd-receipt-divider" />

          <div className="bd-receipt-row">
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>

          {promoDiscount > 0 && (
            <div className="bd-receipt-row">
              <span>Promo discount</span>
              <span>-{money(promoDiscount)}</span>
            </div>
          )}

          {discountType !== "none" && (
            <>
              <div className="bd-receipt-row">
                <span>VAT exemption (preview)</span>
                <span>-{money(vatExemptAmount)}</span>
              </div>

              <div className="bd-receipt-row">
                <span>
                  {discountType === "senior"
                    ? "Senior Citizen"
                    : "PWD"}{" "}
                  discount
                </span>
                <span>-{money(statutoryDiscount)}</span>
              </div>
            </>
          )}

          <div className="bd-receipt-divider" />

          <div className="bd-receipt-row bd-receipt-total">
            <strong>ESTIMATED TOTAL</strong>
            <strong>{money(total)}</strong>
          </div>

          <div className="bd-receipt-divider" />

          <div className="bd-receipt-row">
            <span>Selected method</span>
            <span>{paymentMethod}</span>
          </div>

          {paymentMethod === "Cash" && (
            <>
              <div className="bd-receipt-row">
                <span>Cash entered (demo)</span>
                <span>{money(tendered)}</span>
              </div>

              <div className="bd-receipt-row">
                <span>Simulated change</span>
                <span>{money(change)}</span>
              </div>
            </>
          )}

          {paymentMethod === "GCash" && (
            <p className="bd-receipt-notice">
              GCash payment has not been verified.
            </p>
          )}

          <div className="bd-receipt-divider" />

          <div className="bd-receipt-footer">
            <p>Thank you for choosing Brew Desk!</p>
            <strong>PREVIEW ONLY</strong>
            <span>
              Not an official invoice, sales receipt,
              or confirmation of payment.
            </span>
          </div>
        </div>

        <div className="bd-receipt-actions">
          {/* Close Button */}
          <button
            type="button"
            className="bd-receipt-close"
            onClick={onClose}
            disabled={saving}
          >
            <X size={15} />
            Close
          </button>

          {/* Print Preview Button */}
          <button
            type="button"
            className="bd-receipt-print"
            onClick={() => window.print()}
            disabled={saving}
          >
            <Printer size={15} />
            Print Preview
          </button>

          {/* Complete Transaction Button */}
          {data.paymentMethod === "Cash" && (
            <button
              type="button"
              className="bd-receipt-print"
              onClick={onComplete}
              disabled={saving}
            >
              {saving ? "Saving..." : "Complete Transaction"}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
