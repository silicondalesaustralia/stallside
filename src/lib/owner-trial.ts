import { COMPLIMENTARY_ACCESS_EMAILS, TRIAL_DAYS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { Role, SubscriptionStatus } from "@/generated/prisma/client";

export function trialEndDate(from = new Date()): Date {
  const end = new Date(from);
  end.setUTCDate(end.getUTCDate() + TRIAL_DAYS);
  return end;
}

/**
 * Create an owner on Free: every feature, Stallside card fee applies.
 * No Pro trial - upgrade anytime to waive the fee.
 */
export async function createOwnerWithTrial(input: {
  userId: string;
  name: string;
  email: string;
}) {
  const now = new Date();
  const displayName = input.name.trim() || "My stand";

  return prisma.owner.create({
    data: {
      userId: input.userId,
      businessName: displayName,
      contactEmail: input.email,
      subscriptionStatus: SubscriptionStatus.NONE,
      subscriptionPlan: "free",
      subscriptionStartedAt: now,
      trialEndsAt: null,
      monthlyFeeCents: 0,
    },
  });
}

export type OwnerAccessFields = {
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: Date | null;
  stripeSubscriptionId: string | null;
  currentPeriodEndsAt: Date | null;
  cancelAtPeriodEnd: boolean;
};

function hasFutureDate(value: Date | null): boolean {
  return value != null && value.getTime() > Date.now();
}

export type ComplimentaryAccessInput = {
  email?: string | null;
  role?: Role | string | null;
  /** Owner.lifetimeAccess from Free for Life invite / admin grant */
  lifetimeAccess?: boolean | null;
};

/** Admin users, allowlisted emails, and lifetime invitees never need a paid subscription. */
export function hasComplimentaryAccess(input: ComplimentaryAccessInput): boolean {
  if (input.lifetimeAccess) return true;
  if (input.role === Role.ADMIN) return true;
  const email = (input.email ?? "").trim().toLowerCase();
  return (COMPLIMENTARY_ACCESS_EMAILS as readonly string[]).includes(email);
}

const PRO_PLANS = new Set(["pro", "pro_paypal", "card", "card_paypal"]);

function isActiveFreeTrial(owner: {
  subscriptionStatus?: SubscriptionStatus | string | null;
  trialEndsAt?: Date | null;
}): boolean {
  if (owner.subscriptionStatus !== SubscriptionStatus.TRIALING) return false;
  if (!owner.trialEndsAt) return true;
  return hasFutureDate(owner.trialEndsAt);
}

function isPaidProPlan(plan: string | null | undefined): boolean {
  return PRO_PLANS.has((plan ?? "").trim().toLowerCase());
}

/**
 * Pro features: paid Pro, active free Pro trial, complimentary / admin / lifetime,
 * or still inside cancel-at-period-end window while on a Pro plan.
 */
export function ownerHasProAccess(
  owner: {
    subscriptionPlan?: string | null;
    lifetimeAccess?: boolean | null;
    subscriptionStatus?: SubscriptionStatus | string | null;
    trialEndsAt?: Date | null;
    currentPeriodEndsAt?: Date | null;
    cancelAtPeriodEnd?: boolean;
  },
  access?: ComplimentaryAccessInput,
): boolean {
  if (owner.lifetimeAccess) return true;
  if (access && hasComplimentaryAccess(access)) return true;
  if (isActiveFreeTrial(owner)) return true;

  const plan = (owner.subscriptionPlan ?? "").trim().toLowerCase();
  if (!isPaidProPlan(plan)) return false;

  if (
    owner.subscriptionStatus === SubscriptionStatus.ACTIVE ||
    owner.subscriptionStatus === SubscriptionStatus.PAST_DUE
  ) {
    return true;
  }

  // Cancelled / ended but still inside paid period.
  if (hasFutureDate(owner.currentPeriodEndsAt ?? null)) return true;

  return false;
}

/**
 * Dashboard is never locked for a live owner account (Free plan).
 * Kept for call-site compatibility; always true when complimentary or any real owner row.
 */
export function ownerHasAppAccess(
  _owner?: OwnerAccessFields & { lifetimeAccess?: boolean | null },
  _access?: ComplimentaryAccessInput,
): boolean {
  return true;
}

/** @deprecated Dashboard is never payment-locked. Always false. */
export function ownerNeedsPayment(
  _owner?: OwnerAccessFields,
  _access?: ComplimentaryAccessInput,
): boolean {
  return false;
}

function daysUntil(date: Date): number {
  const ms = date.getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

/** Free-trial days remaining (null if not on an active app trial). */
export function trialDaysRemaining(
  owner: OwnerAccessFields & { lifetimeAccess?: boolean | null },
  access?: ComplimentaryAccessInput,
): number | null {
  if (owner.lifetimeAccess) return null;
  if (access && hasComplimentaryAccess(access)) return null;
  if (owner.stripeSubscriptionId) return null;
  if (owner.subscriptionStatus !== SubscriptionStatus.TRIALING) return null;
  if (!owner.trialEndsAt) return null;
  return daysUntil(owner.trialEndsAt);
}

/**
 * Days until Pro access ends after cancel-at-period-end
 * (or cancelled but still inside the paid window).
 */
export function paidAccessDaysRemaining(
  owner: OwnerAccessFields & {
    lifetimeAccess?: boolean | null;
    subscriptionPlan?: string | null;
  },
  access?: ComplimentaryAccessInput,
): number | null {
  if (owner.lifetimeAccess) return null;
  if (access && hasComplimentaryAccess(access)) return null;
  if (!ownerHasProAccess(owner, access)) return null;
  if (!hasFutureDate(owner.currentPeriodEndsAt)) return null;
  if (owner.subscriptionStatus === SubscriptionStatus.ACTIVE && !owner.cancelAtPeriodEnd) {
    return null;
  }
  if (
    owner.cancelAtPeriodEnd ||
    owner.subscriptionStatus === SubscriptionStatus.CANCELLED
  ) {
    return daysUntil(owner.currentPeriodEndsAt!);
  }
  return null;
}

/** Normalize legacy plan strings to free | pro | pro_paypal. */
export function normalizeSubscriptionPlan(
  plan: string | null | undefined,
): "free" | "pro" | "pro_paypal" {
  const p = (plan ?? "free").trim().toLowerCase();
  if (p === "pro" || p === "card") return "pro";
  if (p === "pro_paypal" || p === "card_paypal") return "pro_paypal";
  return "free";
}
