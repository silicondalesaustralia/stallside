"use client";

import type { DiscountInput } from "@/lib/discounts/input";

const inputClass = "rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm";

const TYPES: { value: DiscountInput["type"]; label: string }[] = [
  { value: "PERCENT_OFF", label: "Percentage off" },
  { value: "FIXED_OFF", label: "Fixed amount off" },
  { value: "FREE_DELIVERY", label: "Free shipping" },
];

export default function DiscountValueFields({
  value,
  onChange,
  currency,
}: {
  value: DiscountInput;
  onChange: (patch: Partial<DiscountInput>) => void;
  currency: string;
}) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-lg border border-[var(--line)] p-4">
      <legend className="px-1 text-sm font-semibold">What shoppers get</legend>
      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <label
            key={t.value}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
              value.type === t.value ? "border-[var(--leaf)] bg-[var(--wash)] font-medium" : "border-[var(--line)]"
            }`}
          >
            <input
              type="radio"
              name="discount-type"
              checked={value.type === t.value}
              onChange={() => onChange({ type: t.value, value: "" })}
              className="sr-only"
            />
            {t.label}
          </label>
        ))}
      </div>
      {value.type !== "FREE_DELIVERY" ? (
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">
            {value.type === "PERCENT_OFF" ? "Percent off" : `Amount off (${currency})`}
          </span>
          <input
            required
            inputMode={value.type === "PERCENT_OFF" ? "numeric" : "decimal"}
            value={value.value}
            onChange={(e) => onChange({ value: e.target.value })}
            placeholder={value.type === "PERCENT_OFF" ? "10" : "5.00"}
            className={inputClass}
          />
        </label>
      ) : (
        <p className="text-xs text-[var(--muted)]">Removes the shipping charge on delivered orders.</p>
      )}
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Minimum spend (optional)</span>
        <input
          inputMode="decimal"
          value={value.minOrder}
          onChange={(e) => onChange({ minOrder: e.target.value })}
          placeholder="No minimum"
          className={inputClass}
        />
      </label>
    </fieldset>
  );
}
