import { SubscriptionStatus } from "@/generated/prisma/client";
import {
  stallsideFeeCents,
  stallsidePassOnChargeCents,
  stallsidePassOnFeeCents,
} from "@/lib/money";

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
 * Stallside fee is waived only for lifetime or paid Pro.
 * Complimentary / admin feature access does not waive the fee (so Free can be tested).
 */
export function shouldChargeStallsideFee(owner: FeeOwner): boolean {
  if (owner.lifetimeAccess) return false;

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

export function ownerPassesFeeToCustomer(owner: FeeOwner): boolean {
  return Boolean(owner.passFeeToCustomer);
}

/** Absorb mode: fee on item subtotal. Pass-on: use computeStallsideCheckoutFees. */
export function computeStallsideApplicationFee(
  itemTotalCents: number,
  owner: FeeOwner,
): number {
  if (!shouldChargeStallsideFee(owner)) return 0;
  if (ownerPassesFeeToCustomer(owner)) {
    return stallsidePassOnFeeCents(itemTotalCents);
  }
  return stallsideFeeCents(itemTotalCents);
}

/** Shared checkout fee math for server + cart preview. */
export function computeStallsideCheckoutFees(
  subtotalCents: number,
  owner: FeeOwner,
): { applicationFeeCents: number; chargeTotalCents: number } {
  if (!shouldChargeStallsideFee(owner) || subtotalCents <= 0) {
    return { applicationFeeCents: 0, chargeTotalCents: Math.max(0, subtotalCents) };
  }
  if (ownerPassesFeeToCustomer(owner)) {
    const chargeTotalCents = stallsidePassOnChargeCents(subtotalCents);
    return {
      applicationFeeCents: chargeTotalCents - subtotalCents,
      chargeTotalCents,
    };
  }
  return {
    applicationFeeCents: stallsideFeeCents(subtotalCents),
    chargeTotalCents: subtotalCents,
  };
}
