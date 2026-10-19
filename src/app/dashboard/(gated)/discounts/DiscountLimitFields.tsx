"use client";

import type { DiscountInput } from "@/lib/discounts/input";

const inputClass = "rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm";

export default function DiscountLimitFields({
  value,
  onChange,
}: {
  value: DiscountInput;
  onChange: (patch: Partial<DiscountInput>) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-lg border border-[var(--line)] p-4">
      <legend className="px-1 text-sm font-semibold">Dates and limits</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Starts (optional)</span>
          <input
            type="date"
            value={value.startsOn}
            onChange={(e) => onChange({ startsOn: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Ends (optional)</span>
          <input
            type="date"
            value={value.endsOn}
            onChange={(e) => onChange({ endsOn: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Total uses (optional)</span>
          <input
            inputMode="numeric"
            value={value.usageLimit}
            onChange={(e) => onChange({ usageLimit: e.target.value })}
            placeholder="Unlimited"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Uses per shopper</span>
          <input
            inputMode="numeric"
            value={value.perCustomerLimit}
            onChange={(e) => onChange({ perCustomerLimit: e.target.value })}
            placeholder="Unlimited"
            className={inputClass}
          />
          <span className="text-xs text-[var(--muted)]">Counted by receipt email. Blank = unlimited.</span>
        </label>
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={value.firstOrderOnly}
          onChange={(e) => onChange({ firstOrderOnly: e.target.checked })}
          className="mt-0.5 size-4"
        />
        <span>
          <span className="font-medium">First orders only</span>
          <span className="block text-xs text-[var(--muted)]">
            Shoppers enter their email; it won&apos;t work if they&apos;ve ordered before.
          </span>
        </span>
      </label>
    </fieldset>
  );
}
