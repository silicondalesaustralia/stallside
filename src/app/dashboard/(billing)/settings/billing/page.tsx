import Link from "next/link";
import { logout } from "@/app/login/actions";
import { requireOwner } from "@/lib/session";
import {
  cardPlanCents,
  isBillingCurrency,
  type BillingCurrency,
} from "@/lib/saas-pricing";
import {
  listConfiguredProPlanPrices,
  isStripeProBillingConfigured,
} from "@/lib/stripe";
import {
  hasComplimentaryAccess,
  normalizeSubscriptionPlan,
  ownerHasProAccess,
} from "@/lib/owner-trial";
import { openBillingPortal } from "./actions";
import BillingNotices from "./BillingNotices";
import BillingPlanForms from "./BillingPlanForms";
import BillingStatusCard from "./BillingStatusCard";
import BillingPricingNotes from "./BillingPricingNotes";
import { isV2026Owner } from "@/lib/fee-v2026";
import { pricingMoveNotice } from "@/lib/pricing-move-gate";

export default async function BillingSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    success?: string;
    cancelled?: string;
    locked?: string;
    plan?: string;
    error?: string;
  }>;
}) {
  const { owner, user } = await requireOwner();
  const params = await searchParams;
  const proConfigured = isStripeProBillingConfigured();
  const complimentary = {
    email: user.email,
    role: user.role,
    lifetimeAccess: owner.lifetimeAccess,
  };
  const freeForever = hasComplimentaryAccess(complimentary);
  const hasPro = ownerHasProAccess(owner, complimentary);
  const isPaidPro =
    hasPro &&
    (owner.subscriptionStatus === "ACTIVE" ||
      owner.subscriptionStatus === "PAST_DUE") &&
    Boolean(owner.stripeSubscriptionId);
  const cancelling =
    owner.cancelAtPeriodEnd &&
    owner.currentPeriodEndsAt != null &&
    owner.currentPeriodEndsAt.getTime() > Date.now();
  const billingCurrency: BillingCurrency = isBillingCurrency(owner.billingCurrency)
    ? owner.billingCurrency
    : "AUD";
  const planNorm = normalizeSubscriptionPlan(owner.subscriptionPlan);
  const planLabel = freeForever
    ? "Lifetime FREE - All features"
    : planNorm === "pro" || planNorm === "pro_paypal"
      ? "Vendl Pro"
      : "Free plan";
  const feeCents =
    freeForever || planNorm === "free"
      ? 0
      : owner.monthlyFeeCents || cardPlanCents(billingCurrency);
  const showPlanForms = !freeForever && !isPaidPro;

  return (
    <main className="flex w-full max-w-3xl flex-col gap-8">
      <p className="text-sm text-[var(--muted)]">
        <Link href="/dashboard/settings" className="underline">
          Settings
        </Link>
      </p>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Vendl billing</h1>
        <BillingPricingNotes
          v2026={isV2026Owner(owner)}
          isPaidPro={isPaidPro}
          confirmError={params.error === "confirm_required"}
        />
      </div>

      <BillingNotices
        freeForever={freeForever}
        locked={false}
        success={params.success === "1"}
        cancelled={params.cancelled === "1"}
        cancelling={Boolean(cancelling && owner.currentPeriodEndsAt)}
        cancelUntilLabel={
          owner.currentPeriodEndsAt
            ? owner.currentPeriodEndsAt.toLocaleDateString(undefined, {
                dateStyle: "medium",
              })
            : null
        }
      />

      {!proConfigured ? (
        <p className="text-sm text-red-700">
          Pro billing is not configured on the server yet (STRIPE_PRICE_ID_PRO_*
          or STRIPE_PRICE_ID_CARD_*).
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
          proPrices={listConfiguredProPlanPrices()}
          showPro
          proConfigured={proConfigured}
          pricingNotice={pricingMoveNotice(owner)}
        />
      ) : null}

      {owner.stripeCustomerId ? (
        <form action={openBillingPortal}>
          <button
            type="submit"
            disabled={!proConfigured}
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
