import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CartMode, ProductChannelType, StorefrontDomainStatus } from "@/generated/prisma/client";
import { businessPageProductWhere } from "@/lib/product-visibility";
import {
  betaStandRedirectsEnabled,
  isBetaOwner,
  websiteOrigin,
  websitePathFor,
  websiteStandId,
  type BetaStandTarget,
} from "@/lib/beta-stand-redirect-rules";

async function destinationFor(standSlug: string, target: BetaStandTarget): Promise<string | null> {
  const stand = await prisma.stand.findUnique({
    where: { slug: decodeURIComponent(standSlug).trim().toLowerCase() },
    select: { id: true, ownerId: true, isActive: true, cartMode: true, owner: { select: { betaFeatures: true } } },
  });
  if (!stand?.isActive || stand.cartMode === CartMode.CUSTOMER_CHOICE) return null;
  if (!isBetaOwner(stand.owner.betaFeatures)) return null;

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
  if (websiteStandId(stands.map((s) => s.id), storefront.draftConfig) !== stand.id) return null;

  const primary = await prisma.storefrontDomain.findFirst({
    where: { storefrontId: storefront.id, isPrimary: true, status: StorefrontDomainStatus.ACTIVE },
    select: { hostname: true },
  });
  let productOnSite = true;
  if (target.kind === "product") {
    const slug = decodeURIComponent(target.productSlug).trim().toLowerCase();
    const hit = await prisma.product.findFirst({
      where: {
        AND: [
          { slug },
          businessPageProductWhere,
          { channels: { some: { channelType: ProductChannelType.ONLINE, standId: stand.id, isEnabled: true } } },
        ],
      },
      select: { id: true },
    });
    productOnSite = Boolean(hit);
  }
  return `${websiteOrigin(storefront.slug, primary?.hostname ?? null)}${websitePathFor(target, productOnSite)}`;
}

/**
 * Beta owners only: once their beta website is published, old `/s/{stand}` links go to the same
 * page there. Temporary (307), so unpublishing brings the stand pages straight back.
 */
export async function redirectBetaStandToWebsite(standSlug: string, target: BetaStandTarget): Promise<void> {
  if (!betaStandRedirectsEnabled()) return;
  const h = await headers();
  if (!(h.get("x-stallside-pathname") ?? "").startsWith("/s/")) return;

  let destination: string | null = null;
  try {
    const found = await destinationFor(standSlug, target);
    if (found) destination = `${found}${h.get("x-stallside-search") ?? ""}`;
  } catch (err) {
    console.error("[beta-stand-redirect] lookup failed; serving stand page", err);
  }
  if (destination) redirect(destination);
}
