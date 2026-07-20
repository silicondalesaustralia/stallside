import { formatMoney } from "@/lib/money";
import type { BillingCurrency } from "@/lib/saas-pricing";

const STATUS_LABEL: Record<string, string> = {
  NONE: "No active subscription",
  TRIALING: "Free trial",
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
  return (
    <section className="space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
      <p>
        Plan: {planLabel} · {formatMoney(feeCents, billingCurrency)}/mo (
        {billingCurrency})
      </p>
      <p>Status: {STATUS_LABEL[subscriptionStatus] ?? subscriptionStatus}</p>
      {accessUntil ? (
        <p>
          Access until:{" "}
          {accessUntil.toLocaleDateString(undefined, { dateStyle: "medium" })}
        </p>
      ) : null}
    </section>
  );
}
