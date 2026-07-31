import PaymentIconRow from "@/components/PaymentIconRow";
import type { BillingCurrency } from "@/lib/saas-pricing";
import {
  CARD_PLAN_BILLING_BLURB,
  CARD_PLAN_BLURB,
  CARD_PLAN_FEATURES,
  CARD_PLAN_HARDWARE_BLURB,
  CARD_PLAN_RESTOCK_BLURB,
  cardPaymentBrands,
  cashPaymentBrands,
  cashPlanExtraBlurb,
  starterPlanFeatures,
} from "@/lib/plan-copy";

export default function PlanFeatureBlock({
  plan,
  currency,
}: {
  plan: "starter" | "pro" | "cash" | "card";
  currency: BillingCurrency;
}) {
  const isStarter = plan === "starter" || plan === "cash";

  if (isStarter) {
    const extra = cashPlanExtraBlurb(currency);
    const features = starterPlanFeatures(currency);
    return (
      <div className="space-y-2">
        <PaymentIconRow brands={cashPaymentBrands(currency)} />
        {extra ? (
          <p className="text-sm text-[var(--muted)]">{extra}</p>
        ) : null}
        <ul className="list-disc space-y-1.5 pl-4 text-sm text-[var(--muted)]">
          {features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <PaymentIconRow brands={cardPaymentBrands(currency)} />
      <p className="text-sm text-[var(--muted)]">{CARD_PLAN_BLURB}</p>
      <p className="text-sm text-[var(--muted)]">{CARD_PLAN_RESTOCK_BLURB}</p>
      <ul className="list-disc space-y-1.5 pl-4 text-sm text-[var(--muted)]">
        {CARD_PLAN_FEATURES.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <p className="text-sm font-semibold text-[var(--marigold)]">
        {CARD_PLAN_HARDWARE_BLURB}
      </p>
      <p className="text-sm text-[var(--muted)]">{CARD_PLAN_BILLING_BLURB}</p>
    </div>
  );
}
