import { prisma } from "@/lib/prisma";
import { isBetaApp } from "@/lib/beta-app";

/** Owner.betaFeatures entry that lets an owner into the beta app (any plan). */
export const BETA_APP_ACCESS = "beta";

export function hasBetaAppAccess(owner: { betaFeatures: string[] } | null): boolean {
  return Boolean(owner?.betaFeatures.includes(BETA_APP_ACCESS));
}

/**
 * Social kit access: everyone on the beta app (only beta owners get in) or when
 * SOCIAL_SECTION_LIVE=1 (full release); otherwise only beta owners.
 */
export function socialKitEnabledFor(owner: { betaFeatures: string[] } | null): boolean {
  if (isBetaApp() || process.env.SOCIAL_SECTION_LIVE === "1") return true;
  return hasBetaAppAccess(owner);
}

export async function socialKitEnabledForOwnerId(ownerId: string): Promise<boolean> {
  if (isBetaApp() || process.env.SOCIAL_SECTION_LIVE === "1") return true;
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
    select: { betaFeatures: true },
  });
  return socialKitEnabledFor(owner);
}
