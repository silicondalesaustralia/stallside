import Link from "next/link";
import { logout } from "@/app/login/actions";
import { requireOwner } from "@/lib/session";
import { formatMoney } from "@/lib/money";
import {
  BILLING_CURRENCIES,
  cardPlanCents,
  cashPlanCents,
  isBillingCurrency,
  type BillingCurrency,
} from "@/lib/saas-pricing";
import {
  listConfiguredCardPlanPrices,
  listConfiguredCashPlanPrices,
  isStripeBillingConfigured,
  isStripeCardBillingConfigured,
} from "@/lib/stripe";
import { hasComplimentaryAccess, ownerNeedsPayment } from "@/lib/owner-trial";
import {
  openBillingPortal,
  startCardPlanCheckout,
  startCashPlanCheckout,
} from "./actions";

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
    plan?: string;
  }>;
}) {
  const { owner, user } = await requireOwner();
  const params = await searchParams;
  const configured = isStripeBillingConfigured();
  const cardConfigured = isStripeCardBillingConfigured();
  const complimentary = { email: user.email, role: user.role };
  const freeForever = hasComplimentaryAccess(complimentary);
  const isPaid =
    owner.subscriptionStatus === "ACTIVE" ||
    owner.subscriptionStatus === "PAST_DUE";
  const needsPayment = ownerNeedsPayment(owner, complimentary);
  const trialActive =
    owner.subscriptionStatus === "TRIALING" &&
    owner.trialEndsAt != null &&
    owner.trialEndsAt.getTime() > Date.now() &&
    !owner.stripeSubscriptionId;
  const cancelling =
    owner.cancelAtPeriodEnd &&
    owner.currentPeriodEndsAt != null &&
    owner.currentPeriodEndsAt.getTime() > Date.now();
  const cashPrices = listConfiguredCashPlanPrices();
  const cardPrices = listConfiguredCardPlanPrices();
  const billingCurrency: BillingCurrency = isBillingCurrency(owner.billingCurrency)
    ? owner.billingCurrency
    : "AUD";
  const planLabel =
    (owner.subscriptionPlan ?? "cash").toLowerCase() === "card"
      ? "Card / Tap & Go"
      : "Cash";
  const feeCents =
    owner.monthlyFeeCents ||
    ((owner.subscriptionPlan ?? "").toLowerCase() === "card"
      ? cardPlanCents(billingCurrency)
      : cashPlanCents(billingCurrency));
  const preferCard = params.plan === "card";
  const onCardPlan =
    (owner.subscriptionPlan ?? "").trim().toLowerCase() === "card" ||
    (owner.subscriptionPlan ?? "").trim().toLowerCase() === "card_paypal";
  const showPlanForms =
    !freeForever && (!isPaid || needsPayment || preferCard || !onCardPlan);

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
          This is what you pay Stallside for the app, not stand customer payments.
        </p>
      </div>

      {freeForever ? (
        <p className="rounded-xl border border-[var(--leaf)]/30 bg-[var(--leaf)]/10 px-4 py-3 text-sm">
          Complimentary access — full dashboard forever, no subscription required.
        </p>
      ) : null}
      {!freeForever && (params.locked === "1" || needsPayment) ? (
        <p className="rounded-xl border border-[var(--marigold)]/40 bg-[var(--marigold)]/10 px-4 py-3 text-sm">
          Your subscription is not active. Stands, products, inventory, and orders
          stay saved. Subscribe again to reopen the app.
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
          Cash free trial active until{" "}
          {owner.trialEndsAt.toLocaleDateString(undefined, {
            dateStyle: "medium",
          })}
          . Card / Tap &amp; Go has no free trial.
        </p>
      ) : null}
      {cancelling && owner.currentPeriodEndsAt ? (
        <p className="text-sm text-[var(--muted)]">
          Cancellation scheduled. You keep full access until{" "}
          {owner.currentPeriodEndsAt.toLocaleDateString(undefined, {
            dateStyle: "medium",
          })}
          . Resubscribe anytime. Your data stays.
        </p>
      ) : null}

      {!configured ? (
        <p className="text-sm text-red-700">
          Cash billing is not configured on the server yet (Stripe cash Price IDs).
        </p>
      ) : null}

      <section className="space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 text-sm">
        <p>
          Plan: {planLabel} · {formatMoney(feeCents, billingCurrency)}/mo (
          {billingCurrency})
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

      {showPlanForms ? (
        <div className="space-y-6">
          {!isPaid || needsPayment ? (
            <form action={startCashPlanCheckout} className="space-y-3">
              <p className="text-sm font-semibold">Cash plan</p>
              <p className="text-sm text-[var(--muted)]">
                After the free trial, or subscribe early.
              </p>
              <div className="flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-[var(--ink)]">Currency</span>
                  <select
                    name="currency"
                    defaultValue={
                      cashPrices.some((p) => p.currency === billingCurrency)
                        ? billingCurrency
                        : cashPrices[0]?.currency ?? "AUD"
                    }
                    className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
                  >
                    {(cashPrices.length
                      ? cashPrices.map((p) => p.currency)
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
                  className="rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold disabled:opacity-50"
                >
                  Subscribe to Cash
                </button>
              </div>
            </form>
          ) : null}

          {!onCardPlan ? (
            <form action={startCardPlanCheckout} className="space-y-3">
              <p className="text-sm font-semibold">Card / Tap &amp; Go plan</p>
              <p className="text-sm text-[var(--muted)]">
                No free trial — billed from day one. Unlocks Stripe Connect and Tap
                &amp; Go at your stands.
              </p>
              <div className="flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-[var(--ink)]">Currency</span>
                  <select
                    name="currency"
                    defaultValue={
                      cardPrices.some((p) => p.currency === billingCurrency)
                        ? billingCurrency
                        : cardPrices[0]?.currency ?? "AUD"
                    }
                    className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
                  >
                    {(cardPrices.length
                      ? cardPrices.map((p) => p.currency)
                      : [...BILLING_CURRENCIES]
                    ).map((code) => (
                      <option key={code} value={code}>
                        {code} · {formatMoney(cardPlanCents(code), code)}/mo
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  disabled={!cardConfigured}
                  className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-50"
                >
                  Subscribe to Card
                </button>
              </div>
              {!cardConfigured ? (
                <p className="text-sm text-red-700">
                  Card plan Price IDs are not set on the server yet (
                  STRIPE_PRICE_ID_CARD_*).
                </p>
              ) : null}
            </form>
          ) : null}
        </div>
      ) : null}
      {owner.stripeCustomerId ? (
        <form action={openBillingPortal}>
          <button
            type="submit"
            disabled={!configured && !cardConfigured}
            className="rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold disabled:opacity-50"
          >
            Manage payment method / cancel
          </button>
        </form>
      ) : null}

      <form action={logout}>
        <button type="submit" className="text-sm text-[var(--leaf-dark)] underline">
          Sign out
        </button>
      </form>
    </main>
  );
}
