import { ownerHasProAccess } from "@/lib/owner-trial";

type OwnerForBrand = {
  subscriptionPlan?: string | null;
  lifetimeAccess?: boolean | null;
  subscriptionStatus?: string | null;
  trialEndsAt?: Date | null;
  currentPeriodEndsAt?: Date | null;
  cancelAtPeriodEnd?: boolean;
  user?: { email?: string | null; role?: string | null } | null;
};

/** Pro branding on the public stall; Starter uses defaults (config kept in DB). */
export function publicStandBranding<T extends {
  logoUrl: string | null;
  accentColor: string | null;
  secondaryColor: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  youtubeUrl?: string | null;
  websiteUrl?: string | null;
}>(stand: T, owner: OwnerForBrand): T {
  if (
    ownerHasProAccess(owner, {
      email: owner.user?.email,
      role: owner.user?.role,
      lifetimeAccess: owner.lifetimeAccess,
    })
  ) {
    return stand;
  }
  return {
    ...stand,
    logoUrl: null,
    accentColor: null,
    secondaryColor: null,
    instagramUrl: null,
    facebookUrl: null,
    tiktokUrl: null,
    youtubeUrl: null,
    websiteUrl: null,
  };
}
