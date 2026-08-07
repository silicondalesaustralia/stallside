import { SubscriptionStatus } from "@/generated/prisma/client";
import { formatMoney } from "@/lib/money";
import {
  cardPlanCents,
  isBillingCurrency,
  type BillingCurrency,
} from "@/lib/saas-pricing";
import {
  hasComplimentaryAccess,
  normalizeSubscriptionPlan,
  type ComplimentaryAccessInput,
} from "@/lib/owner-trial";

export type SubscriptionSummaryOwner = {
  lifetimeAccess?: boolean | null;
  subscriptionStatus: SubscriptionStatus | string;
  subscriptionPlan?: string | null;
  stripeSubscriptionId?: string | null;
  monthlyFeeCents?: number | null;
  billingCurrency?: string | null;
};

function billingCurrencyOf(owner: SubscriptionSummaryOwner): BillingCurrency {
  const raw = owner.billingCurrency ?? "";
  return isBillingCurrency(raw) ? raw : "AUD";
}

function paidPlanLabel(plan: string | null | undefined): string {
  const p = normalizeSubscriptionPlan(plan);
  if (p === "pro" || p === "pro_paypal") return "Vendl Pro";
  return "Free";
}

function paidFeeCents(
  owner: SubscriptionSummaryOwner,
  currency: BillingCurrency,
): number {
  const p = normalizeSubscriptionPlan(owner.subscriptionPlan);
  if (p === "free") return 0;
  if (owner.monthlyFeeCents && owner.monthlyFeeCents > 0) {
    return owner.monthlyFeeCents;
  }
  return cardPlanCents(currency);
}

function statusLabel(status: string): string {
  switch (status) {
    case SubscriptionStatus.ACTIVE:
      return "Active";
    case SubscriptionStatus.PAST_DUE:
      return "Past due";
    case SubscriptionStatus.CANCELLED:
      return "Cancelled";
    case SubscriptionStatus.TRIALING:
      // Stripe Billing can still report trialing; treat as Free for app copy.
      return "Free";
    case SubscriptionStatus.NONE:
      return "Free";
    default:
      return status;
  }
}

/** One-line Vendl subscription summary for Settings (and similar). */
export function stallsideSubscriptionSummary(
  owner: SubscriptionSummaryOwner,
  access?: ComplimentaryAccessInput,
): string {
  if (
    owner.lifetimeAccess ||
    hasComplimentaryAccess({
      ...access,
      lifetimeAccess: owner.lifetimeAccess ?? access?.lifetimeAccess,
    })
  ) {
    return "Lifetime FREE - All features";
  }

  const currency = billingCurrencyOf(owner);
  const plan = paidPlanLabel(owner.subscriptionPlan);
  const fee = formatMoney(paidFeeCents(owner, currency), currency);
  const status = statusLabel(String(owner.subscriptionStatus));
  const norm = normalizeSubscriptionPlan(owner.subscriptionPlan);

  if (norm === "free") {
    return "Free plan";
  }

  if (
    owner.subscriptionStatus === SubscriptionStatus.ACTIVE ||
    owner.subscriptionStatus === SubscriptionStatus.PAST_DUE ||
    owner.subscriptionStatus === SubscriptionStatus.CANCELLED
  ) {
    return `${plan}: ${fee}/mo. Status: ${status}.`;
  }

  return `Status: ${status}.`;
}
