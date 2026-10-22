import { prisma } from "@/lib/prisma";

export const SOCIAL_BETA = "social";

/**
 * Social kit access: everyone when SOCIAL_SECTION_LIVE=1 (staging / full release),
 * otherwise only owners an admin has added to the social beta (any plan).
 */
export function socialKitEnabledFor(owner: { betaFeatures: string[] } | null): boolean {
  if (process.env.SOCIAL_SECTION_LIVE === "1") return true;
  return Boolean(owner?.betaFeatures.includes(SOCIAL_BETA));
}

export async function socialKitEnabledForOwnerId(ownerId: string): Promise<boolean> {
  if (process.env.SOCIAL_SECTION_LIVE === "1") return true;
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
    select: { betaFeatures: true },
  });
  return socialKitEnabledFor(owner);
}
