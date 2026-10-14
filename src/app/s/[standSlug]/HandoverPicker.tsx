"use client";

import type { HandoverValue } from "@/lib/fulfilment/handover-choice";

const OPTIONS: { value: HandoverValue; label: string }[] = [
  { value: "COLLECT", label: "Pick up" },
  { value: "DELIVER", label: "Delivery" },
];

export default function HandoverPicker({
  value,
  onChange,
}: {
  value: HandoverValue;
  onChange: (value: HandoverValue) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-4">
      <legend className="px-1 text-sm font-medium">How would you like your order?</legend>
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center justify-center rounded-lg border-2 px-3 py-3 text-base font-semibold ${
                selected
                  ? "border-[var(--site-btn-bg,var(--leaf))] bg-[var(--wash)] text-[var(--ink)]"
                  : "border-[var(--line)] bg-white text-[var(--muted)]"
              }`}
            >
              <input
                type="radio"
                name="handover"
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
