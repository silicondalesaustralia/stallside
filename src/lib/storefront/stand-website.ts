import { prisma } from "@/lib/prisma";
import type { CartMode } from "@/generated/prisma/client";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";
import { getCanonicalStorefrontUrl } from "@/lib/domains/preferred-origin";
import { pickWebsiteStand } from "./website-stand";

export type StandWebsite = {
  standId: string;
  cartMode: CartMode;
  storefrontSlug: string;
  primaryCustomHostname: string | null;
};

/**
 * The published website a stand's old `/s/{stand}` links now belong to, or null
 * when the owner hasn't published or picked another stand for the website.
 */
export async function publishedWebsiteForStand(standSlug: string): Promise<StandWebsite | null> {
  const stand = await prisma.stand.findUnique({
    where: { slug: standSlug.trim().toLowerCase() },
    select: { id: true, ownerId: true, isActive: true, cartMode: true },
  });
  if (!stand?.isActive) return null;
  const storefront = await prisma.storefront.findUnique({
    where: { ownerId: stand.ownerId },
    select: { id: true, slug: true, isPublished: true, draftConfig: true },
  });
  if (!storefront?.isPublished) return null;
  const stands = await prisma.stand.findMany({
    where: { ownerId: stand.ownerId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (pickWebsiteStand(stands, storefront.draftConfig)?.id !== stand.id) return null;
  return {
    standId: stand.id,
    cartMode: stand.cartMode,
    storefrontSlug: storefront.slug,
    primaryCustomHostname: await loadPrimaryCustomHostname(storefront.id),
  };
}

/** Absolute public URL for a path on the stand's website (custom domain, subdomain or /shop path). */
export function standWebsiteUrl(site: StandWebsite, path: string): string {
  return getCanonicalStorefrontUrl(
    { slug: site.storefrontSlug, primaryCustomHostname: site.primaryCustomHostname },
    path,
  );
}
