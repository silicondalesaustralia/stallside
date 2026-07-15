import { COMPLIMENTARY_ACCESS_EMAILS, TRIAL_DAYS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { Role, SubscriptionStatus } from "@/generated/prisma/client";

export function trialEndDate(from = new Date()): Date {
  const end = new Date(from);
  end.setUTCDate(end.getUTCDate() + TRIAL_DAYS);
  return end;
}

/** Start a no-card 30-day trial when creating an owner profile. */
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
      subscriptionStatus: SubscriptionStatus.TRIALING,
      subscriptionPlan: "cash",
      subscriptionStartedAt: now,
      trialEndsAt: trialEndDate(now),
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
};

/** Admin users and allowlisted emails never need a paid subscription. */
export function hasComplimentaryAccess(input: ComplimentaryAccessInput): boolean {
  if (input.role === Role.ADMIN) return true;
  const email = (input.email ?? "").trim().toLowerCase();
  return (COMPLIMENTARY_ACCESS_EMAILS as readonly string[]).includes(email);
}

/** Owner may use stands/products/orders — data is always retained. */
export function ownerHasAppAccess(
  owner: OwnerAccessFields,
  access?: ComplimentaryAccessInput,
): boolean {
  if (access && hasComplimentaryAccess(access)) return true;
  if (owner.subscriptionStatus === SubscriptionStatus.ACTIVE) return true;
  if (owner.subscriptionStatus === SubscriptionStatus.PAST_DUE) return true;

  if (owner.subscriptionStatus === SubscriptionStatus.TRIALING) {
    if (!owner.trialEndsAt) return true;
    return hasFutureDate(owner.trialEndsAt);
  }

  // Cancelled (or scheduled to end): keep access until paid period finishes.
  if (hasFutureDate(owner.currentPeriodEndsAt)) return true;

  return false;
}

export function ownerNeedsPayment(
  owner: OwnerAccessFields,
  access?: ComplimentaryAccessInput,
): boolean {
  return !ownerHasAppAccess(owner, access);
}

function daysUntil(date: Date): number {
  const ms = date.getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

/** Free-trial days remaining (null if not on an active app trial). */
export function trialDaysRemaining(
  owner: OwnerAccessFields,
  access?: ComplimentaryAccessInput,
): number | null {
  if (access && hasComplimentaryAccess(access)) return null;
  if (owner.stripeSubscriptionId) return null;
  if (owner.subscriptionStatus !== SubscriptionStatus.TRIALING) return null;
  if (!owner.trialEndsAt) return null;
  return daysUntil(owner.trialEndsAt);
}

/**
 * Days until paid access ends after cancel-at-period-end
 * (or cancelled but still inside the paid window).
 */
export function paidAccessDaysRemaining(
  owner: OwnerAccessFields,
  access?: ComplimentaryAccessInput,
): number | null {
  if (access && hasComplimentaryAccess(access)) return null;
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
