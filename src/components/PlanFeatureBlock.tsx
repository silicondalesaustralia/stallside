import PaymentIconRow from "@/components/PaymentIconRow";
import type { BillingCurrency } from "@/lib/saas-pricing";
import {
  CARD_PLAN_BILLING_BLURB,
  CARD_PLAN_BLURB,
  CARD_PLAN_HARDWARE_BLURB,
  cardPaymentBrands,
  cashPaymentBrands,
  cashPlanBlurb,
  cashPlanTrialBlurb,
} from "@/lib/plan-copy";

export default function PlanFeatureBlock({
  plan,
  currency,
}: {
  plan: "cash" | "card";
  currency: BillingCurrency;
}) {
  if (plan === "cash") {
    return (
      <div className="space-y-2">
        <PaymentIconRow brands={cashPaymentBrands(currency)} />
        <p className="text-sm text-[var(--muted)]">{cashPlanBlurb(currency)}</p>
        <p className="text-sm text-[var(--muted)]">{cashPlanTrialBlurb(currency)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <PaymentIconRow brands={cardPaymentBrands(currency)} />
      <p className="text-sm text-[var(--muted)]">{CARD_PLAN_BLURB}</p>
      <p className="text-sm font-semibold text-[var(--marigold)]">
        {CARD_PLAN_HARDWARE_BLURB}
      </p>
      <p className="text-sm text-[var(--muted)]">{CARD_PLAN_BILLING_BLURB}</p>
    </div>
  );
}
