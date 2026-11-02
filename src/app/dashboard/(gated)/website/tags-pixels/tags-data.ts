import type { PillSpec } from "@/components/dashboard/ui/StatusPill";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import type { TagItemStatus } from "@/lib/website/tracking/catalog";
import { extractStorefrontTracking, trackingMatches } from "@/lib/website/tracking/config";
import { liveSiteOrigin } from "@/lib/website/tracking/server/live-origin";

export async function loadTagsPageData(owner: { id: string; businessName: string }) {
  const storefront = await ensureStorefront(owner.id, owner.businessName);
  const draft = extractStorefrontTracking(storefront.draftConfig);
  const live = extractStorefrontTracking(storefront.publishedConfig);
  const sitePublished = storefront.isPublished && storefront.publishedConfig !== null;
  const inSync = trackingMatches(draft, live);
  const origin = await liveSiteOrigin(storefront);
  return { storefront, draft, live, sitePublished, inSync, origin };
}

export function liveStatusText(sitePublished: boolean, inSync: boolean): string {
  if (!sitePublished) return "Publish your website first. Tags only run on your live site.";
  return inSync ? "Your live website has the latest saved tags." : "You have saved changes that aren't live yet.";
}

export function tagStatusPill(status: TagItemStatus, sitePublished: boolean): PillSpec {
  if (status === "off") return { label: "Not added", tone: "neutral" };
  if (status === "removing") return { label: "Removed, not live yet", tone: "attention" };
  if (!sitePublished) return { label: "Saved", tone: "info" };
  return status === "live" ? { label: "Live", tone: "success" } : { label: "Saved, not live yet", tone: "attention" };
}
