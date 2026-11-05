"use client";

import { formatMoney } from "@/lib/money";
import {
  annualPlanCents,
  cardPlanCents,
  type BillingCurrency,
  type BillingInterval,
} from "@/lib/saas-pricing";

const OPTION_CLASS =
  "flex flex-1 cursor-pointer flex-col gap-0.5 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm has-[:checked]:border-[var(--leaf)] has-[:checked]:ring-1 has-[:checked]:ring-[var(--leaf)]";

export default function BillingIntervalToggle({
  currency,
  interval,
  onChange,
}: {
  currency: BillingCurrency;
  interval: BillingInterval;
  onChange: (interval: BillingInterval) => void;
}) {
  const monthly = cardPlanCents(currency);
  const yearly = annualPlanCents(currency);
  const saving = monthly * 12 - yearly;

  return (
    <fieldset className="flex flex-wrap gap-3">
      <legend className="mb-1 text-sm font-medium text-[var(--ink)]">Billing</legend>
      <label className={OPTION_CLASS}>
        <span className="flex items-center gap-2 font-semibold">
          <input
            type="radio"
            name="interval"
            value="month"
            checked={interval === "month"}
            onChange={() => onChange("month")}
          />
          Monthly
        </span>
        <span className="text-[var(--muted)]">{formatMoney(monthly, currency)} / month</span>
      </label>
      <label className={OPTION_CLASS}>
        <span className="flex items-center gap-2 font-semibold">
          <input
            type="radio"
            name="interval"
            value="year"
            checked={interval === "year"}
            onChange={() => onChange("year")}
          />
          Annual
        </span>
        <span className="text-[var(--muted)]">
          {formatMoney(yearly, currency)} / year · save {formatMoney(saving, currency)}
        </span>
      </label>
    </fieldset>
  );
}
