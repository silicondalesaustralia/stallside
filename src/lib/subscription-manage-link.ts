import { subscriptionManageUrl } from "@/lib/subscription-offer";
import { publishedWebsiteForStand, standWebsiteUrl } from "@/lib/storefront/stand-website";

/**
 * Manage link for new emails: `/subscriptions/manage/{token}` on the stand's
 * published website, else the stand page. Old `/s/{stand}/sub/manage/…` links keep working.
 */
export async function subscriptionManageLink(standSlug: string, token: string): Promise<string> {
  try {
    const site = await publishedWebsiteForStand(standSlug);
    if (site) return standWebsiteUrl(site, `/subscriptions/manage/${encodeURIComponent(token)}`);
  } catch (err) {
    console.error("[subscription-manage-link] website lookup failed", err);
  }
  return subscriptionManageUrl(standSlug, token);
}
