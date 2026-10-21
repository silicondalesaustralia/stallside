import { SITE_URL } from "@/lib/legal";
import { preOrderPagePath } from "@/lib/preorder-page";
import { subscriptionOfferPath } from "@/lib/subscription-offer";
import { publishedWebsiteForStand, standWebsiteUrl, type StandWebsite } from "./stand-website";

export type StandPublicLinks = {
  offer: (offerSlug: string) => string;
  preOrder: (pageSlug: string) => string;
};

/** Public links for a stand's offers and pre-order pages: on the published website, else the stand page. */
export async function standPublicLinks(standSlug: string): Promise<StandPublicLinks> {
  let site: StandWebsite | null = null;
  try {
    site = await publishedWebsiteForStand(standSlug);
  } catch (err) {
    console.error("[stand public links] website lookup failed", standSlug, err);
  }
  const seg = encodeURIComponent;
  return {
    offer: (slug) =>
      site ? standWebsiteUrl(site, `/subscriptions/${seg(slug)}`) : `${SITE_URL}${subscriptionOfferPath(standSlug, slug)}`,
    preOrder: (slug) =>
      site ? standWebsiteUrl(site, `/pre-orders/${seg(slug)}`) : `${SITE_URL}${preOrderPagePath(standSlug, slug)}`,
  };
}
