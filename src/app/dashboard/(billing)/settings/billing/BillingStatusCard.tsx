import { formatMoney } from "@/lib/money";
import {
  annualPlanCents,
  billingRegionDisplay,
  proIntervalFromMonthlyFee,
  type BillingCurrency,
} from "@/lib/saas-pricing";

const STATUS_LABEL: Record<string, string> = {
  NONE: "No active subscription",
  TRIALING: "Free plan",
  ACTIVE: "Active",
  PAST_DUE: "Past due",
  CANCELLED: "Cancelled",
};

export default function BillingStatusCard({
  planLabel,
  feeCents,
  billingCurrency,
  subscriptionStatus,
  accessUntil,
}: {
  planLabel: string;
  feeCents: number;
  billingCurrency: BillingCurrency;
  subscriptionStatus: string;
  accessUntil: Date | null;
}) {
  const lifetime = planLabel.startsWith("Lifetime FREE");
  const region = billingRegionDisplay(billingCurrency);
  const yearly =
    feeCents > 0 && proIntervalFromMonthlyFee(feeCents, billingCurrency) === "year";

  return (
    <section className="space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
      {lifetime ? (
        <p>{planLabel}</p>
      ) : (
        <>
          <p>
            Plan: {planLabel} ·{" "}
            {yearly
              ? `${formatMoney(annualPlanCents(billingCurrency), billingCurrency)}/yr`
              : `${formatMoney(feeCents, billingCurrency)}/mo`}{" "}
            ({billingCurrency})
          </p>
          <p>Status: {STATUS_LABEL[subscriptionStatus] ?? subscriptionStatus}</p>
        </>
      )}
      <p>
        Billing region: <strong>{region}</strong>
      </p>
      {accessUntil && !lifetime ? (
        <p>
          Access until:{" "}
          {accessUntil.toLocaleDateString(undefined, { dateStyle: "medium" })}
        </p>
      ) : null}
    </section>
  );
}
