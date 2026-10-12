import { Role, SubscriptionStatus } from "@/generated/prisma/client";
import { COMPLIMENTARY_ACCESS_EMAILS } from "@/lib/constants";
import { stallsideFeeCents, stallsidePassOnChargeCents } from "@/lib/money";
import type { FeeRail } from "@/lib/fee-v2026";

export type { FeeRail } from "@/lib/fee-v2026";

type FeeOwner = {
  pricingModel?: string | null;
  subscriptionPlan?: string | null;
  lifetimeAccess?: boolean | null;
  subscriptionStatus?: SubscriptionStatus | string | null;
  trialEndsAt?: Date | null;
  currentPeriodEndsAt?: Date | null;
  cancelAtPeriodEnd?: boolean;
  passFeeToCustomer?: boolean | null;
  billingCurrency?: string | null;
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

export function isComplimentaryFeeWaiver(
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
 * Vendl fee applies on Free only.
 * Waived for lifetime, paid Pro, and platform-admin / complimentary accounts
 * (admin stays fee-free even when the plan is switched to Free for testing).
 */
export function shouldChargeVendlFee(
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

function isAud(currency: string | null | undefined): boolean {
  return (currency ?? "").trim().toUpperCase() === "AUD";
}

/** Card surcharges are banned in Australia, so AUD accounts and checkouts always absorb the fee. */
export function feePassOnAllowed(
  owner: FeeOwner,
  currency?: string | null,
): boolean {
  return !isAud(owner.billingCurrency) && !isAud(currency);
}

export function ownerPassesFeeToCustomer(
  owner: FeeOwner,
  currency?: string | null,
): boolean {
  return Boolean(owner.passFeeToCustomer) && feePassOnAllowed(owner, currency);
}

export type CheckoutFeeOpts = {
  rail: FeeRail;
  currency: string;
  access?: FeeAccess;
};

/** Shared checkout fee math for server + cart preview. */
export function computeVendlCheckoutFees(
  subtotalCents: number,
  owner: FeeOwner,
  opts: CheckoutFeeOpts,
): { applicationFeeCents: number; chargeTotalCents: number; passedOn: boolean } {
  const base = Math.max(0, subtotalCents);
  if (subtotalCents <= 0) {
    return { applicationFeeCents: 0, chargeTotalCents: base, passedOn: false };
  }

  if (!shouldChargeVendlFee(owner, opts.access)) {
    return { applicationFeeCents: 0, chargeTotalCents: base, passedOn: false };
  }

  if (ownerPassesFeeToCustomer(owner, opts.currency)) {
    const chargeTotalCents = stallsidePassOnChargeCents(base);
    return {
      applicationFeeCents: chargeTotalCents - base,
      chargeTotalCents,
      passedOn: chargeTotalCents > base,
    };
  }
  return {
    applicationFeeCents: stallsideFeeCents(base),
    chargeTotalCents: base,
    passedOn: false,
  };
}
