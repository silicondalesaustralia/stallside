import { Role, SubscriptionStatus } from "@/generated/prisma/client";
import { COMPLIMENTARY_ACCESS_EMAILS } from "@/lib/constants";
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
  /** Used to recognise platform-admin / complimentary accounts. */
  contactEmail?: string | null;
};

type FeeAccess = {
  email?: string | null;
  role?: Role | string | null;
};

const PRO_PLANS = new Set(["pro", "pro_paypal", "card", "card_paypal"]);

function hasFutureDate(value: Date | null | undefined): boolean {
  return value != null && value.getTime() > Date.now();
}

function isComplimentaryFeeWaiver(
  owner: FeeOwner,
  access?: FeeAccess,
): boolean {
  if (owner.lifetimeAccess) return true;
  if (access?.role === Role.ADMIN) return true;
  const email = (access?.email ?? owner.contactEmail ?? "")
    .trim()
    .toLowerCase();
  return (COMPLIMENTARY_ACCESS_EMAILS as readonly string[]).includes(email);
}

/**
 * Stallside fee applies on Free only.
 * Waived for lifetime, paid Pro, and platform-admin / complimentary accounts
 * (admin stays fee-free even when the plan is switched to Free for testing).
 */
export function shouldChargeStallsideFee(
  owner: FeeOwner,
  access?: FeeAccess,
): boolean {
  if (isComplimentaryFeeWaiver(owner, access)) return false;

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
  access?: FeeAccess,
): number {
  if (!shouldChargeStallsideFee(owner, access)) return 0;
  if (ownerPassesFeeToCustomer(owner)) {
    return stallsidePassOnFeeCents(itemTotalCents);
  }
  return stallsideFeeCents(itemTotalCents);
}

/** Shared checkout fee math for server + cart preview. */
export function computeStallsideCheckoutFees(
  subtotalCents: number,
  owner: FeeOwner,
  access?: FeeAccess,
): { applicationFeeCents: number; chargeTotalCents: number } {
  if (!shouldChargeStallsideFee(owner, access) || subtotalCents <= 0) {
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
