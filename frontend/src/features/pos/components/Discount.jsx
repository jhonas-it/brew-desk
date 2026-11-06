export default function StatutoryDiscount({
  items,
  discountType,
  onDiscountTypeChange,
  beneficiary,
  onBeneficiaryChange,
  eligibleQuantities,
  onEligibleQuantityChange,
}) {
  const isStatutory = discountType !== "none";

  return (
    <div className="mt-3 rounded-xl border e8e9ed bg-[#ffffff] p-3 ">
      <p className="mb-2 text-xs font-bold text-slate-800">
        Customer Discount
      </p>

      <div className="grid grid-cols-3 gap-1 text-[10px]">
        {[
          { value: "none", label: "None" },
          { value: "senior", label: "Senior" },
          { value: "pwd", label: "PWD" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() =>
              onDiscountTypeChange(option.value)
            }
            className={`rounded-lg border px-2 py-2 text-[10px] font-semibold ${discountType === option.value
                ? "border-[#F4511E] bg-[#F4511E] text-white"
                : "border-slate-200 bg-white text-slate-600"
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {isStatutory && (
        <div className="mt-3 space-y-3">
          <div>
            <label
              htmlFor="bd-beneficiary-name"
              className="mb-1 block text-[10px] font-semibold"
            >
              Beneficiary full name
            </label>

            <input
              id="bd-beneficiary-name"
              type="text"
              value={beneficiary.name}
              onChange={(event) =>
                onBeneficiaryChange({
                  ...beneficiary,
                  name: event.target.value,
                  verified: false,
                })
              }
              placeholder="Enter full name"
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 py-0 text-[14px] placeholder:text-[14px] outline-none focus:border-orange-500" />
          </div>

          <div>
            <label
              htmlFor="bd-beneficiary-id"
              className="mb-1 block text-[10px] font-semibold"
            >
              {discountType === "senior"
                ? "Senior Citizen ID number"
                : "PWD ID number"}
            </label>

            <input
              id="bd-beneficiary-id"
              type="text"
              value={beneficiary.idNumber}
              onChange={(event) =>
                onBeneficiaryChange({
                  ...beneficiary,
                  idNumber: event.target.value,
                  verified: false,
                })
              }
              placeholder="Enter ID number"
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 py-0 text-[14px]  placeholder:text-[14px] outline-none focus:border-orange-500"

            />
          </div>

          <div className="border-t border-orange-100 pt-3">
            <p className="mb-1 text-[10px] font-semibold">
              Eligible items
            </p>

            <p className="mb-2 text-[10px] text-slate-500">
              Select only the quantities for the eligible
              customer's personal consumption.
            </p>

            <div className="max-h-36 space-y-2 overflow-y-auto">
              {items.map((item, index) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-2 rounded-lg bg-white p-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-medium">
                      {item.name}
                    </p>

                    <p className="text-[9px] text-slate-400">
                      {item.variantName} · {item.quantity} in cart
                    </p>
                  </div>

                  <select
                    aria-label={`Eligible quantity for ${item.name}`}
                    value={Math.min(
                      item.quantity,
                      eligibleQuantities[item.key] || 0
                    )}
                    onChange={(event) =>
                      onEligibleQuantityChange(
                        item.key,
                        Number(event.target.value)
                      )
                    }
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
                  >
                    {Array.from(
                      { length: item.quantity + 1 },
                      (_, quantity) => (
                        <option
                          key={quantity}
                          value={quantity}
                        >
                          {quantity}
                        </option>
                      )
                    )}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <label className="flex items-start gap-2 text-[10px] text-slate-600">
            <input
              type="checkbox"
              checked={beneficiary.verified}
              onChange={(event) =>
                onBeneficiaryChange({
                  ...beneficiary,
                  verified: event.target.checked,
                })
              }
              className="mt-0.5 accent-[#F4511E]"
            />

            <span>
              I have checked the customer's eligibility
              and identification.
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
