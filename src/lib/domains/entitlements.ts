import type { ComplimentaryAccessInput } from "@/lib/owner-trial";
import { ownerHasProAccess } from "@/lib/owner-trial";
import type { SubscriptionStatus } from "@/generated/prisma/client";

export function ownerCanUseCustomDomains(
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
  return ownerHasProAccess(owner, access);
}
