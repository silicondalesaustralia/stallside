"use client";

import type { BillingInterval } from "@/lib/saas-pricing";

const OPTIONS: readonly { value: BillingInterval; label: string }[] = [
  { value: "month", label: "Monthly" },
  { value: "year", label: "Annual" },
];

export default function MakersLpIntervalToggle({
  interval,
  onChange,
}: {
  interval: BillingInterval;
  onChange: (interval: BillingInterval) => void;
}) {
  return (
    <div role="group" aria-label="Billing period" className="inline-flex rounded-full border border-[var(--line)] p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={interval === option.value}
          onClick={() => onChange(option.value)}
          className={`min-h-10 rounded-full px-5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--leaf)] ${
            interval === option.value ? "bg-[var(--field)] text-white" : "text-[var(--field)] hover:bg-[#edf0e6]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
