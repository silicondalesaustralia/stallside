import { SubscriptionStatus } from "@/generated/prisma/client";
import { stallsideFeeCents } from "@/lib/money";

type FeeOwner = {
  subscriptionPlan?: string | null;
  lifetimeAccess?: boolean | null;
  subscriptionStatus?: SubscriptionStatus | string | null;
  trialEndsAt?: Date | null;
  currentPeriodEndsAt?: Date | null;
  cancelAtPeriodEnd?: boolean;
  passFeeToCustomer?: boolean | null;
};

const PRO_PLANS = new Set(["pro", "pro_paypal", "card", "card_paypal"]);

function hasFutureDate(value: Date | null | undefined): boolean {
  return value != null && value.getTime() > Date.now();
}

/**
 * Stallside fee is waived only for lifetime, active Pro trial, or paid Pro.
 * Complimentary / admin feature access does not waive the fee (so Free can be tested).
 */
export function shouldChargeStallsideFee(owner: FeeOwner): boolean {
  if (owner.lifetimeAccess) return false;

  if (
    owner.subscriptionStatus === SubscriptionStatus.TRIALING &&
    (owner.trialEndsAt == null || hasFutureDate(owner.trialEndsAt))
  ) {
    return false;
  }

  const plan = (owner.subscriptionPlan ?? "").trim().toLowerCase();
  if (!PRO_PLANS.has(plan)) return true;

  if (
    owner.subscriptionStatus === SubscriptionStatus.ACTIVE ||
    owner.subscriptionStatus === SubscriptionStatus.PAST_DUE
  ) {
    return false;
  }
  if (hasFutureDate(owner.currentPeriodEndsAt)) return false;

  return true;
}

export function computeStallsideApplicationFee(
  itemTotalCents: number,
  owner: FeeOwner,
): number {
  if (!shouldChargeStallsideFee(owner)) return 0;
  return stallsideFeeCents(itemTotalCents);
}

export function ownerPassesFeeToCustomer(owner: FeeOwner): boolean {
  return Boolean(owner.passFeeToCustomer);
}
