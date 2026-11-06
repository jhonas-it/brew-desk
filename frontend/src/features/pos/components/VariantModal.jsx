
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(price);

export default function VariantModal({
  product,
  quantity,
  open,
  onClose,
  onSelect,
}) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) onClose();
    }}>
      <DialogContent className="max-w-[520px] bg-[#FEFEFE]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {product.name} - Choose size
          </DialogTitle>
          <DialogDescription>
            Choose your preferred variation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2 py-3">
          {product.variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white p-3 text-center transition hover:border-[#F4511E] hover:bg-[#FFF4ED]"
              onClick={() => onSelect(variant)}
            >
              <span className="text-sm font-medium">
                {variant.name}
              </span>

              <span className="text-lg font-bold">
                {formatPrice(variant.price)}
              </span>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-500">
          Quantity: {quantity}
        </p>
      </DialogContent>
    </Dialog>
  );
}
