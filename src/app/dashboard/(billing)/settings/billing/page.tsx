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
import { ownerNeedsPayment } from "@/lib/owner-trial";
import { openBillingPortal, startCashPlanCheckout } from "./actions";

const STATUS_LABEL: Record<string, string> = {
  NONE: "No active subscription",
  TRIALING: "Free trial",
  ACTIVE: "Active",
  PAST_DUE: "Past due",
  CANCELLED: "Cancelled",
};

export default async function BillingSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    success?: string;
    cancelled?: string;
    trial?: string;
    locked?: string;
  }>;
}) {
  const { owner } = await requireOwner();
  const params = await searchParams;
  const configured = isStripeBillingConfigured();
  const isPaid =
    owner.subscriptionStatus === "ACTIVE" ||
    owner.subscriptionStatus === "PAST_DUE";
  const needsPayment = ownerNeedsPayment(owner);
  const trialActive =
    owner.subscriptionStatus === "TRIALING" &&
    owner.trialEndsAt != null &&
    owner.trialEndsAt.getTime() > Date.now() &&
    !owner.stripeSubscriptionId;
  const cancelling =
    owner.cancelAtPeriodEnd &&
    owner.currentPeriodEndsAt != null &&
    owner.currentPeriodEndsAt.getTime() > Date.now();
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
          This is what you pay Stallside for the app — not stand customer payments.
        </p>
      </div>

      {params.locked === "1" || needsPayment ? (
        <p className="rounded-xl border border-[var(--marigold)]/40 bg-[var(--marigold)]/10 px-4 py-3 text-sm">
          Your subscription is not active. Stands, products, inventory, and orders
          stay saved — subscribe again to reopen the app.
        </p>
      ) : null}
      {params.trial === "ended" && needsPayment ? (
        <p className="text-sm text-[var(--muted)]">
          Your free trial has ended.
        </p>
      ) : null}
      {params.success === "1" ? (
        <p className="text-sm text-[var(--leaf-dark)]">
          Subscription started. Status updates within a few seconds.
        </p>
      ) : null}
      {params.cancelled === "1" ? (
        <p className="text-sm text-[var(--muted)]">Checkout cancelled.</p>
      ) : null}
      {trialActive && owner.trialEndsAt ? (
        <p className="text-sm text-[var(--leaf-dark)]">
          Free trial active until{" "}
          {owner.trialEndsAt.toLocaleDateString(undefined, {
            dateStyle: "medium",
          })}
          . No card needed until then.
        </p>
      ) : null}
      {cancelling && owner.currentPeriodEndsAt ? (
        <p className="text-sm text-[var(--muted)]">
          Cancellation scheduled. You keep full access until{" "}
          {owner.currentPeriodEndsAt.toLocaleDateString(undefined, {
            dateStyle: "medium",
          })}
          . Resubscribe anytime — your data stays.
        </p>
      ) : null}

      {!configured ? (
        <p className="text-sm text-red-700">
          Billing is not configured on the server yet (Stripe price IDs).
        </p>
      ) : null}

      <section className="space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
        <p>
          Plan: Cash · {formatMoney(feeCents, billingCurrency)}/mo ({billingCurrency})
        </p>
        <p>Status: {STATUS_LABEL[owner.subscriptionStatus] ?? owner.subscriptionStatus}</p>
        {cancelling && owner.currentPeriodEndsAt ? (
          <p>
            Access until:{" "}
            {owner.currentPeriodEndsAt.toLocaleDateString(undefined, {
              dateStyle: "medium",
            })}
          </p>
        ) : null}
      </section>

      {!isPaid || needsPayment ? (
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
              {(available.length
                ? available.map((p) => p.currency)
                : [...BILLING_CURRENCIES]
              ).map((code) => (
                <option key={code} value={code}>
                  {code} · {formatMoney(cashPlanCents(code), code)}/mo
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={!configured}
            className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-50"
          >
            {needsPayment || owner.subscriptionStatus === "CANCELLED"
              ? "Resubscribe"
              : "Subscribe early"}
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
    </main>
  );
}
