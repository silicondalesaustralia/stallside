import PaymentIconRow from "@/components/PaymentIconRow";
import type { BillingCurrency } from "@/lib/saas-pricing";
import {
  CARD_PLAN_BILLING_BLURB,
  CARD_PLAN_BLURB,
  CARD_PLAN_HARDWARE_BLURB,
  FREE_PLAN_FEE_BLURB,
  PRO_BREAK_EVEN_BLURB,
  cardPaymentBrands,
  cashPlanExtraBlurb,
  starterPlanFeatures,
} from "@/lib/plan-copy";

export default function PlanFeatureBlock({
  plan,
  currency,
}: {
  plan: "free" | "starter" | "pro" | "cash" | "card";
  currency: BillingCurrency;
}) {
  const isFree = plan === "free" || plan === "starter" || plan === "cash";

  if (isFree) {
    const extra = cashPlanExtraBlurb(currency);
    const features = starterPlanFeatures(currency);
    return (
      <div className="space-y-2">
        <PaymentIconRow brands={cardPaymentBrands(currency)} />
        <p className="text-sm text-[var(--muted)]">
          Every Stallside feature, with no monthly fee.
        </p>
        <p className="text-sm font-semibold text-[var(--marigold)]">
          {FREE_PLAN_FEE_BLURB}
        </p>
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
      <p className="text-sm font-semibold text-[var(--marigold)]">
        No Stallside fee on card, Tap &amp; Go or pay-later payments. Standard
        Stripe processing fees still apply.
      </p>
      <p className="text-sm text-[var(--muted)]">{PRO_BREAK_EVEN_BLURB}</p>
      <p className="text-sm font-semibold text-[var(--marigold)]">
        {CARD_PLAN_HARDWARE_BLURB}
      </p>
      <p className="text-sm text-[var(--muted)]">{CARD_PLAN_BILLING_BLURB}</p>
    </div>
  );
}
