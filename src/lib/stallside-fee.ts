import { Role, SubscriptionStatus } from "@/generated/prisma/client";
import { COMPLIMENTARY_ACCESS_EMAILS } from "@/lib/constants";
import { stallsideFeeCents, stallsidePassOnChargeCents } from "@/lib/money";
import {
  isV2026Owner,
  proOverageFeeCents,
  stripeFixedFeeCents,
  type FeeRail,
} from "@/lib/fee-v2026";

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

/** Fixed per-transaction Vendl fee: V2026 Free plan on Stripe only. */
export function vendlFixedFeeCents(
  owner: FeeOwner,
  rail: FeeRail,
  currency: string,
  access?: FeeAccess,
): number {
  if (rail !== "stripe" || !isV2026Owner(owner)) return 0;
  if (!shouldChargeVendlFee(owner, access)) return 0;
  return stripeFixedFeeCents(currency);
}

export type CheckoutFeeOpts = {
  rail: FeeRail;
  currency: string;
  access?: FeeAccess;
  /** Month-to-date Stripe sales; enables the V2026 Pro overage fee. */
  monthStripeVolumeCents?: number;
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
    const overage =
      opts.rail === "stripe" &&
      isV2026Owner(owner) &&
      !isComplimentaryFeeWaiver(owner, opts.access) &&
      opts.monthStripeVolumeCents != null
        ? proOverageFeeCents(base, opts.monthStripeVolumeCents)
        : 0;
    return { applicationFeeCents: overage, chargeTotalCents: base, passedOn: false };
  }

  const fixed = vendlFixedFeeCents(owner, opts.rail, opts.currency, opts.access);
  if (ownerPassesFeeToCustomer(owner, opts.currency)) {
    const chargeTotalCents = stallsidePassOnChargeCents(base, fixed);
    return {
      applicationFeeCents: chargeTotalCents - base,
      chargeTotalCents,
      passedOn: chargeTotalCents > base,
    };
  }
  return {
    applicationFeeCents: Math.min(base, stallsideFeeCents(base) + fixed),
    chargeTotalCents: base,
    passedOn: false,
  };
}
