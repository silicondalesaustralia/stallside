import { TRACKING_FIELD_BY_KEY, type TrackingFieldGroup } from "./fields";
import type { ServerProvider } from "./server/send-conversions";
import type { StorefrontTracking, TrackingIdKey } from "./types";

export type TagGroup = TrackingFieldGroup | "settings";

/** One row on the Tags & Pixels list; `kind` decides which form its page shows. */
export type TagItem = {
  slug: string;
  label: string;
  group: TagGroup;
  summary: string;
  kind: "ids" | "consent" | "custom";
  keys: TrackingIdKey[];
  server?: ServerProvider;
  checkUrl?: string;
};

const idItem = (slug: string, keys: TrackingIdKey[], summary: string, server?: ServerProvider): TagItem => {
  const field = TRACKING_FIELD_BY_KEY.get(keys[0]);
  if (!field) throw new Error(`Unknown tracking key ${keys[0]}`);
  return { slug, label: field.label, group: field.group, summary, kind: "ids", keys, server, checkUrl: field.checkUrl };
};

export const TAG_ITEMS: TagItem[] = [
  idItem("google-search-console", ["gscVerification"], "Verify your site with Google"),
  idItem("bing-webmaster", ["bingVerification"], "Verify your site with Bing"),
  idItem("meta-domain", ["metaDomainVerification"], "Verify your domain with Meta"),
  idItem("pinterest-domain", ["pinterestDomainVerify"], "Claim your site on Pinterest"),
  idItem("google-analytics", ["ga4Id"], "Visitors, sales and server-side purchases", "ga4"),
  idItem("google-tag-manager", ["gtmId"], "Run your own tag container"),
  idItem("microsoft-clarity", ["clarityId"], "Heatmaps and session recordings"),
  idItem("hotjar", ["hotjarId"], "Heatmaps and session recordings"),
  idItem("google-ads", ["googleAdsId", "googleAdsPurchaseLabel"], "Remarketing and purchase conversions"),
  idItem("meta-pixel", ["metaPixelId"], "Facebook and Instagram ads, plus Conversions API", "meta"),
  idItem("tiktok-pixel", ["tiktokPixelId"], "TikTok ads, plus Events API", "tiktok"),
  idItem("pinterest-tag", ["pinterestTagId"], "Pinterest ads conversions"),
  idItem("microsoft-ads", ["microsoftUetId"], "Bing and Microsoft ads conversions"),
  idItem("snapchat-pixel", ["snapPixelId"], "Snapchat ads conversions"),
  idItem("linkedin-insight", ["linkedinPartnerId"], "LinkedIn ads and audiences"),
  idItem("x-pixel", ["xPixelId"], "X (Twitter) ads conversions"),
  idItem("reddit-pixel", ["redditPixelId"], "Reddit ads conversions"),
  { slug: "cookie-consent", label: "Cookie banner & privacy", group: "settings", summary: "Consent banner and privacy-page listing", kind: "consent", keys: [] },
  { slug: "custom-code", label: "Custom code", group: "settings", summary: "Script or meta tags for any other tool", kind: "custom", keys: [] },
];

export const TAG_GROUP_LABELS: Record<TagGroup, string> = {
  verification: "Site verification",
  analytics: "Analytics",
  ads: "Ad pixels & conversion tags",
  settings: "Settings",
};

export const TAG_GROUP_ORDER: TagGroup[] = ["analytics", "ads", "verification", "settings"];

export function tagItemBySlug(slug: string): TagItem | undefined {
  return TAG_ITEMS.find((item) => item.slug === slug);
}

const CONSENT_LABELS = { eu: "EU, UK & Swiss visitors", all: "Every visitor", off: "Banner off" } as const;

/** Short value shown in the list, e.g. the pixel ID. */
export function tagItemValue(item: TagItem, tracking: StorefrontTracking): string | null {
  if (item.kind === "consent") return CONSENT_LABELS[tracking.consentMode];
  if (item.kind === "custom") return tracking.customHead.trim() ? "Added" : null;
  return tracking.ids[item.keys[0]] ?? null;
}

function itemSnapshot(item: TagItem, tracking: StorefrontTracking): string {
  if (item.kind === "consent") return `${tracking.consentMode}|${tracking.privacyNotice}`;
  if (item.kind === "custom") return tracking.customHead.trim();
  return item.keys.map((key) => tracking.ids[key] ?? "").join("|");
}

export type TagItemStatus = "live" | "pending" | "removing" | "off";

/** Compares saved (draft) settings to the live site for one row. */
export function tagItemStatus(item: TagItem, draft: StorefrontTracking, live: StorefrontTracking): TagItemStatus {
  const saved = item.kind === "consent" || Boolean(tagItemValue(item, draft));
  const isLive = item.kind === "consent" || Boolean(tagItemValue(item, live));
  if (!saved) return isLive ? "removing" : "off";
  return itemSnapshot(item, draft) === itemSnapshot(item, live) ? "live" : "pending";
}
