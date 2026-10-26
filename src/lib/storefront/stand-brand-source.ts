import { prisma } from "@/lib/prisma";
import { CartMode } from "@/generated/prisma/client";
import { resolveStorefrontBranding } from "./branding";
import { parseStorefrontConfig } from "./config";
import { legacyStandRedirectsEnabled } from "./legacy-stand-redirect";
import { publishedWebsiteForStand } from "./stand-website";

export type StandBrand = {
  logoUrl: string | null;
  accentColor: string | null;
  secondaryColor: string | null;
};

/**
 * The published website's logo and colours when this stand's public pages now redirect to
 * the website (so Web Studio owns its look), or null when the stand still serves its own
 * `/s/` pages and keeps its own branding.
 */
export async function websiteBrandForStand(standSlug: string): Promise<StandBrand | null> {
  if (!legacyStandRedirectsEnabled()) return null;
  try {
    const site = await publishedWebsiteForStand(standSlug);
    if (!site || site.cartMode === CartMode.CUSTOMER_CHOICE) return null;
    const [stand, storefront] = await Promise.all([
      prisma.stand.findUniqueOrThrow({ where: { id: site.standId }, include: { owner: true } }),
      prisma.storefront.findUniqueOrThrow({ where: { slug: site.storefrontSlug } }),
    ]);
    const config = parseStorefrontConfig(storefront.publishedConfig ?? storefront.draftConfig);
    const branding = resolveStorefrontBranding({ owner: stand.owner, stand, storefront, config });
    return {
      logoUrl: branding.logoUrl,
      accentColor: branding.accentColor,
      secondaryColor: branding.secondaryColor,
    };
  } catch (err) {
    console.error("[websiteBrandForStand] lookup failed; using stand branding", err);
    return null;
  }
}

/** Branding for a stand's QR posters: the website's when it owns the stand's look, else the stand's own. */
export async function standPosterBrand(stand: StandBrand & { slug: string }): Promise<StandBrand> {
  const website = await websiteBrandForStand(stand.slug);
  return (
    website ?? {
      logoUrl: stand.logoUrl,
      accentColor: stand.accentColor,
      secondaryColor: stand.secondaryColor,
    }
  );
}
