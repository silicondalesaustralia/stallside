import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { formatMoney } from "@/lib/money";
import {
  BILLING_CURRENCIES,
  cashPlanCents,
  isBillingCurrency,
  type BillingCurrency,
} from "@/lib/saas-pricing";
import { listConfiguredCashPlanPrices, isStripeBillingConfigured } from "@/lib/stripe";
import { openBillingPortal, startCashPlanCheckout } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  NONE: "No active subscription",
  TRIALING: "Trialing",
  ACTIVE: "Active",
  PAST_DUE: "Past due",
  CANCELLED: "Cancelled",
};

export default async function BillingSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; cancelled?: string }>;
}) {
  const { owner } = await requireOwner();
  const params = await searchParams;
  const configured = isStripeBillingConfigured();
  const isLive =
    owner.subscriptionStatus === "ACTIVE" ||
    owner.subscriptionStatus === "TRIALING";
  const available = listConfiguredCashPlanPrices();
  const billingCurrency: BillingCurrency = isBillingCurrency(owner.billingCurrency)
    ? owner.billingCurrency
    : "AUD";
  const feeCents = owner.monthlyFeeCents || cashPlanCents(billingCurrency);

  return (
    <main className="flex max-w-xl flex-col gap-8">
      <p className="text-sm text-[var(--muted)]">
        <Link href="/dashboard/settings" className="underline">
          Settings
        </Link>
      </p>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Stallside billing
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          This is what you pay Stallside for the app — not the Stripe connection
          customers use when they pay at your stand.
        </p>
      </div>

      {params.success === "1" ? (
        <p className="text-sm text-[var(--leaf-dark)]">
          Subscription started. Status updates within a few seconds.
        </p>
      ) : null}
      {params.cancelled === "1" ? (
        <p className="text-sm text-[var(--muted)]">Checkout cancelled.</p>
      ) : null}

      {!configured ? (
        <p className="text-sm text-red-700">
          Add Stripe cash-plan Price IDs (
          <code className="rounded bg-black/5 px-1">STRIPE_PRICE_ID_CASH_AUD</code>{" "}
          etc.) and <code className="rounded bg-black/5 px-1">STRIPE_SECRET_KEY</code>{" "}
          to enable SaaS billing.
        </p>
      ) : null}

      <section className="space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
        <p>
          Plan: Cash · {formatMoney(feeCents, billingCurrency)}/mo ({billingCurrency})
        </p>
        <p>Status: {STATUS_LABEL[owner.subscriptionStatus] ?? owner.subscriptionStatus}</p>
        <p>
          Customer:{" "}
          {owner.stripeCustomerId ? (
            <code className="text-xs">{owner.stripeCustomerId}</code>
          ) : (
            "Not created yet"
          )}
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        {!isLive ? (
          <form action={startCashPlanCheckout} className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-[var(--ink)]">Currency</span>
              <select
                name="currency"
                defaultValue={
                  available.some((p) => p.currency === billingCurrency)
                    ? billingCurrency
                    : available[0]?.currency ?? "AUD"
                }
                className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
              >
                {(available.length ? available.map((p) => p.currency) : [...BILLING_CURRENCIES]).map(
                  (code) => (
                    <option key={code} value={code}>
                      {code} · {formatMoney(cashPlanCents(code), code)}/mo
                    </option>
                  ),
                )}
              </select>
            </label>
            <button
              type="submit"
              disabled={!configured}
              className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-50"
            >
              Subscribe
            </button>
          </form>
        ) : null}
        {owner.stripeCustomerId ? (
          <form action={openBillingPortal}>
            <button
              type="submit"
              disabled={!configured}
              className="rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold disabled:opacity-50"
            >
              Manage payment method / cancel
            </button>
          </form>
        ) : null}
      </div>

      <p className="text-sm text-[var(--muted)]">
        Billing currency is set when you subscribe. Stand sale currency is separate — set per
        stand. To accept card from stand customers, connect payouts under{" "}
        <Link href="/dashboard/settings/stripe" className="underline">
          Stripe payments
        </Link>
        .
      </p>
    </main>
  );
}
