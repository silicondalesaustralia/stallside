import type { StorefrontContext } from "@/lib/catalogue/storefront";
import { prisma } from "@/lib/prisma";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";
import { defaultBusinessType } from "./business-types";
import { buildPageGraph } from "./graph/page-graph";
import { withPickupPrefill, type PickupForPrefill } from "./profile-prefill";
import { siteFactsFromContext } from "./site-facts-from-context";

async function firstPickup(ownerId: string): Promise<PickupForPrefill | null> {
  try {
    return await prisma.pickupLocation.findFirst({
      where: { ownerId, isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { addressLine1: true, suburb: true, stateTerritory: true, postcode: true, latitude: true, longitude: true },
    });
  } catch (err) {
    console.error("[search profile] pickup prefill", err);
    return null;
  }
}

/** Everything the Business details search-profile card needs. */
export async function loadSearchProfileView(ctx: NonNullable<StorefrontContext>) {
  const host = await loadPrimaryCustomHostname(ctx.storefront.id);
  const facts = siteFactsFromContext(ctx, host);
  const profile = withPickupPrefill(facts.profile, await firstPickup(ctx.owner.id), ctx.stand.currency);
  return {
    profile,
    defaultType: defaultBusinessType(ctx.businessMode),
    graph: buildPageGraph(facts, { name: ctx.branding.headline, description: ctx.branding.subheadline }),
    liveUrl: facts.homeUrl,
  };
}
