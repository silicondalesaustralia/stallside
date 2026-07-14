import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { CASH_PLAN_CENTS } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { isStripeBillingConfigured } from "@/lib/stripe";
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
          Add <code className="rounded bg-black/5 px-1">STRIPE_PRICE_ID_CASH</code>{" "}
          (and <code className="rounded bg-black/5 px-1">STRIPE_SECRET_KEY</code>)
          to enable SaaS billing.
        </p>
      ) : null}

      <section className="space-y-2 text-sm rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
        <p>
          Plan: Cash · {formatMoney(CASH_PLAN_CENTS, "AUD")}/mo
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
          <form action={startCashPlanCheckout}>
            <button
              type="submit"
              disabled={!configured}
              className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-50"
            >
              Subscribe — {formatMoney(CASH_PLAN_CENTS, "AUD")}/mo
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
        To accept card from stand customers, connect payouts under{" "}
        <Link href="/dashboard/settings/stripe" className="underline">
          Stripe payments
        </Link>
        .
      </p>
    </main>
  );
}
