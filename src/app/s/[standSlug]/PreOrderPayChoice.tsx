"use client";

import type { PreOrderPaymentTiming } from "@/lib/pre-order";
import { payOptionLabel } from "@/lib/pre-order-pay-options";

export type PreOrderPayChoiceValue = {
  options: PreOrderPaymentTiming[];
  value: PreOrderPaymentTiming;
  depositPercent: number | null;
  onChange: (value: PreOrderPaymentTiming) => void;
};

/** Shown when a pre-order page offers more than one way to pay. */
export default function PreOrderPayChoice({ options, value, depositPercent, onChange }: PreOrderPayChoiceValue) {
  return (
    <fieldset className="flex flex-col gap-2 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-4 py-3">
      <legend className="px-1 text-base font-semibold">How would you like to pay?</legend>
      {options.map((option) => (
        <label key={option} className="flex items-center gap-3 text-base">
          <input
            type="radio"
            name="preOrderPayChoice"
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
            className="size-5 accent-[var(--leaf)]"
          />
          {payOptionLabel(option, depositPercent)}
        </label>
      ))}
    </fieldset>
  );
}
