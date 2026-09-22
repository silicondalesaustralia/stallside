"use client";

import { formatMoney } from "@/lib/money";
import { membershipPlanIntervalLabel } from "@/lib/membership-offer-pricing";
import {
  membershipPlanLabel,
  type MembershipPlan,
} from "@/lib/subscription-offer";

type PlanOption = { plan: MembershipPlan; priceCents: number };

export default function MembershipPlanPicker({
  plans,
  currency,
  termWeeks,
  billingPlan,
  onChange,
}: {
  plans: PlanOption[];
  currency: string;
  termWeeks: number | null;
  billingPlan: MembershipPlan | "";
  onChange: (plan: MembershipPlan) => void;
}) {
  if (plans.length === 0) return null;

  return (
    <fieldset className="mt-4">
      <legend className="sr-only">Payment plan</legend>
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, minmax(0, 1fr))`,
        }}
      >
        {plans.map((p) => {
          const on = billingPlan === p.plan;
          return (
            <label
              key={p.plan}
              className={`flex min-h-[4.5rem] cursor-pointer flex-col items-center justify-center rounded-[9px] border px-2 py-2.5 text-center ${
                on
                  ? "border-[var(--m-selected-border)] bg-[var(--m-selected-bg)]"
                  : "border-[var(--m-input-border)] bg-[var(--m-input)]"
              }`}
            >
              <input
                type="radio"
                name="billingPlan"
                value={p.plan}
                checked={on}
                onChange={() => onChange(p.plan)}
                className="sr-only"
              />
              <span className="text-sm font-semibold">
                {membershipPlanLabel(p.plan)}
              </span>
              <span className="mt-0.5 text-[15px] font-medium">
                {formatMoney(p.priceCents, currency)}
              </span>
              <span className="text-[12px] text-[var(--m-muted)]">
                {membershipPlanIntervalLabel(p.plan, termWeeks)}
              </span>
            </label>
          );
        })}
      </div>
      <p className="mt-3 text-[13px] leading-snug text-[var(--m-muted)]">
        All prices {currency.toUpperCase()}. Collection stays weekly with every
        payment plan.
        {termWeeks != null
          ? ` ${termWeeks}-week commitment. Ends automatically.`
          : null}
      </p>
    </fieldset>
  );
}
