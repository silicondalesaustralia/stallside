import { ownerHasProAccess } from "@/lib/owner-trial";
import type { Role, SubscriptionStatus } from "@/generated/prisma/client";

export type AffiliateEligibilityInput = {
  deletedAt: Date | null;
  subscriptionPlan: string | null;
  lifetimeAccess: boolean;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: Date | null;
  currentPeriodEndsAt: Date | null;
  cancelAtPeriodEnd: boolean;
  user: { email: string; role: Role };
};

export const affiliateEligibilitySelect = {
  deletedAt: true,
  subscriptionPlan: true,
  lifetimeAccess: true,
  subscriptionStatus: true,
  trialEndsAt: true,
  currentPeriodEndsAt: true,
  cancelAtPeriodEnd: true,
  user: { select: { email: true, role: true } },
} as const;

/** Affiliates must be on live Pro themselves (paid, lifetime or complimentary). */
export function isAffiliateEligible(owner: AffiliateEligibilityInput): boolean {
  if (owner.deletedAt) return false;
  return ownerHasProAccess(owner, {
    email: owner.user.email,
    role: owner.user.role,
    lifetimeAccess: owner.lifetimeAccess,
  });
}
