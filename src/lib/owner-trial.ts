import { TRIAL_DAYS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@/generated/prisma/client";

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

export function ownerNeedsPayment(owner: {
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: Date | null;
  stripeSubscriptionId: string | null;
}): boolean {
  if (owner.stripeSubscriptionId) return false;
  if (owner.subscriptionStatus === SubscriptionStatus.ACTIVE) return false;
  if (owner.subscriptionStatus === SubscriptionStatus.PAST_DUE) return false;

  if (owner.subscriptionStatus === SubscriptionStatus.TRIALING) {
    if (!owner.trialEndsAt) return false;
    return owner.trialEndsAt.getTime() <= Date.now();
  }

  // Legacy owners with no trial: do not hard-gate.
  // Anyone whose app trial ended (or cancelled after trial) must subscribe.
  if (owner.trialEndsAt && owner.trialEndsAt.getTime() <= Date.now()) {
    return true;
  }
  return false;
}

/** Whole days left on free trial (null if not in an active app trial). */
export function trialDaysRemaining(owner: {
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: Date | null;
  stripeSubscriptionId: string | null;
}): number | null {
  if (owner.stripeSubscriptionId) return null;
  if (owner.subscriptionStatus !== SubscriptionStatus.TRIALING) return null;
  if (!owner.trialEndsAt) return null;
  const ms = owner.trialEndsAt.getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
