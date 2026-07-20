import Link from "next/link";
import { logout } from "@/app/login/actions";
import { requireOwner } from "@/lib/session";
import {
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
import { openBillingPortal } from "./actions";
import BillingNotices from "./BillingNotices";
import BillingPlanForms from "./BillingPlanForms";
import BillingStatusCard from "./BillingStatusCard";

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
  const dateOpts = { dateStyle: "medium" as const };

  return (
    <main className="flex max-w-xl flex-col gap-8">
      <p className="text-sm text-[var(--muted)]">
        <Link href="/dashboard/settings" className="underline">
          Settings
        </Link>
      </p>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Stallside billing</h1>
        <p className="mt-2 text-[var(--muted)]">
          This is what you pay Stallside for the app, not stand customer payments.
        </p>
      </div>

      <BillingNotices
        freeForever={freeForever}
        locked={!freeForever && (params.locked === "1" || needsPayment)}
        trialEnded={params.trial === "ended" && needsPayment}
        success={params.success === "1"}
        cancelled={params.cancelled === "1"}
        trialActive={Boolean(trialActive && owner.trialEndsAt)}
        trialEndsLabel={
          owner.trialEndsAt
            ? owner.trialEndsAt.toLocaleDateString(undefined, dateOpts)
            : null
        }
        cancelling={Boolean(cancelling && owner.currentPeriodEndsAt)}
        cancelUntilLabel={
          owner.currentPeriodEndsAt
            ? owner.currentPeriodEndsAt.toLocaleDateString(undefined, dateOpts)
            : null
        }
      />

      {!configured ? (
        <p className="text-sm text-red-700">
          Cash billing is not configured on the server yet (Stripe cash Price IDs).
        </p>
      ) : null}

      <BillingStatusCard
        planLabel={planLabel}
        feeCents={feeCents}
        billingCurrency={billingCurrency}
        subscriptionStatus={owner.subscriptionStatus}
        accessUntil={cancelling ? owner.currentPeriodEndsAt : null}
      />

      {showPlanForms ? (
        <BillingPlanForms
          billingCurrency={billingCurrency}
          cashPrices={listConfiguredCashPlanPrices()}
          cardPrices={listConfiguredCardPlanPrices()}
          showCash={!isPaid || needsPayment}
          showCard={!onCardPlan}
          cashConfigured={configured}
          cardConfigured={cardConfigured}
        />
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
