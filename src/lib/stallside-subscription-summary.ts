import { SubscriptionStatus } from "@/generated/prisma/client";
import { formatMoney } from "@/lib/money";
import {
  cardPlanCents,
  cashPlanCents,
  isBillingCurrency,
  type BillingCurrency,
} from "@/lib/saas-pricing";
import {
  hasComplimentaryAccess,
  type ComplimentaryAccessInput,
} from "@/lib/owner-trial";

export type SubscriptionSummaryOwner = {
  lifetimeAccess?: boolean | null;
  subscriptionStatus: SubscriptionStatus | string;
  subscriptionPlan?: string | null;
  trialEndsAt?: Date | null;
  stripeSubscriptionId?: string | null;
  monthlyFeeCents?: number | null;
  billingCurrency?: string | null;
};

function billingCurrencyOf(owner: SubscriptionSummaryOwner): BillingCurrency {
  const raw = owner.billingCurrency ?? "";
  return isBillingCurrency(raw) ? raw : "AUD";
}

function isActiveTrial(owner: SubscriptionSummaryOwner): boolean {
  if (owner.subscriptionStatus !== SubscriptionStatus.TRIALING) return false;
  if (owner.stripeSubscriptionId) return false;
  if (!owner.trialEndsAt) return true;
  return owner.trialEndsAt.getTime() > Date.now();
}

function paidPlanLabel(plan: string | null | undefined): string {
  const p = (plan ?? "cash").trim().toLowerCase();
  if (p === "card" || p === "card_paypal") return "Card / Tap & Go";
  return "Cash";
}

function paidFeeCents(
  owner: SubscriptionSummaryOwner,
  currency: BillingCurrency,
): number {
  if (owner.monthlyFeeCents && owner.monthlyFeeCents > 0) {
    return owner.monthlyFeeCents;
  }
  const p = (owner.subscriptionPlan ?? "cash").trim().toLowerCase();
  if (p === "card" || p === "card_paypal") return cardPlanCents(currency);
  return cashPlanCents(currency);
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
      return "Free trial";
    case SubscriptionStatus.NONE:
      return "No active subscription";
    default:
      return status;
  }
}

/** One-line Stallside subscription summary for Settings (and similar). */
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

  if (isActiveTrial(owner)) {
    return "30 day free trial";
  }

  const currency = billingCurrencyOf(owner);
  const plan = paidPlanLabel(owner.subscriptionPlan);
  const fee = formatMoney(paidFeeCents(owner, currency), currency);
  const status = statusLabel(String(owner.subscriptionStatus));

  if (
    owner.subscriptionStatus === SubscriptionStatus.ACTIVE ||
    owner.subscriptionStatus === SubscriptionStatus.PAST_DUE ||
    owner.subscriptionStatus === SubscriptionStatus.CANCELLED
  ) {
    return `${plan}: ${fee}/mo. Status: ${status}.`;
  }

  return `Status: ${status}.`;
}
