import type { Prisma } from "@/generated/prisma/client";
import { normalizeBusinessMode } from "@/lib/business-mode";
import { buildDefaultStorefrontConfig } from "@/lib/storefront/config";
import { parseAccentColor } from "@/lib/stand-brand";
import type { StorefrontConfig } from "@/lib/storefront/types";

export const SEED_OWNER_SELECT = {
  businessMode: true,
  fulfilmentIntents: true,
  businessName: true,
  shortDescription: true,
  brandLogoUrl: true,
  brandAccentColor: true,
  brandSecondaryColor: true,
} as const;

type SeedOwner = Prisma.OwnerGetPayload<{ select: typeof SEED_OWNER_SELECT }>;

/**
 * First website draft, copied from the business details entered at onboarding.
 * After this the website keeps its own copy; edits never write back to the business.
 */
export function buildSeededDraftConfig(owner: SeedOwner): StorefrontConfig {
  const base = buildDefaultStorefrontConfig({
    businessMode: normalizeBusinessMode(owner.businessMode),
    fulfilmentIntents: owner.fulfilmentIntents,
  });
  const accentColor = parseAccentColor(owner.brandAccentColor) ?? undefined;
  const secondaryColor = parseAccentColor(owner.brandSecondaryColor) ?? undefined;
  return {
    ...base,
    themeOverrides: {
      ...(accentColor ? { accentColor } : {}),
      ...(secondaryColor ? { secondaryColor } : {}),
    },
    identity: {
      headline: owner.businessName,
      subheadline: owner.shortDescription,
      about: owner.shortDescription,
      ...(owner.brandLogoUrl ? { logoUrl: owner.brandLogoUrl } : {}),
    },
  };
}
