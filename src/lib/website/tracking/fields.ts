import type { TrackingIdKey } from "./types";

export type TrackingFieldGroup = "verification" | "analytics" | "ads";

export type TrackingField = {
  key: TrackingIdKey;
  label: string;
  group: TrackingFieldGroup;
  placeholder: string;
  help: string;
  pattern: RegExp;
  /** Pull the id out of a pasted snippet or meta tag; group 1 is the id. */
  extractors: RegExp[];
  caseMode?: "upper" | "lower";
  /** Where the seller checks the platform received it. */
  checkUrl?: string;
};

const metaContent = (name: string) =>
  new RegExp(`name=["']${name}["'][^>]*content=["']([^"']+)["']`, "i");

export const TRACKING_FIELDS: TrackingField[] = [
  { key: "gscVerification", label: "Google Search Console", group: "verification", placeholder: "abc123…", help: "HTML tag method: paste the meta tag or just the content value.", pattern: /^[A-Za-z0-9_-]{20,100}$/, extractors: [metaContent("google-site-verification"), /google-site-verification=([A-Za-z0-9_-]+)/], checkUrl: "https://search.google.com/search-console" },
  { key: "bingVerification", label: "Bing Webmaster Tools", group: "verification", placeholder: "32-character code", help: "Meta tag method (msvalidate.01).", pattern: /^[A-F0-9]{32}$/, extractors: [metaContent("msvalidate\\.01")], caseMode: "upper", checkUrl: "https://www.bing.com/webmasters" },
  { key: "metaDomainVerification", label: "Meta domain verification", group: "verification", placeholder: "abc123…", help: "Business settings → Brand safety → Domains → Meta-tag verification.", pattern: /^[a-z0-9]{20,40}$/, extractors: [metaContent("facebook-domain-verification")], caseMode: "lower", checkUrl: "https://business.facebook.com/settings/owned-domains" },
  { key: "pinterestDomainVerify", label: "Pinterest domain claim", group: "verification", placeholder: "32-character code", help: "Claim website → Add HTML tag.", pattern: /^[a-f0-9]{32}$/, extractors: [metaContent("p:domain_verify")], caseMode: "lower", checkUrl: "https://www.pinterest.com/settings/claim" },
  { key: "ga4Id", label: "Google Analytics 4", group: "analytics", placeholder: "G-XXXXXXXXXX", help: "Admin → Data streams → Measurement ID.", pattern: /^G-[A-Z0-9]{4,12}$/, extractors: [/\b(G-[A-Z0-9]{4,12})\b/i], caseMode: "upper", checkUrl: "https://tagassistant.google.com" },
  { key: "gtmId", label: "Google Tag Manager", group: "analytics", placeholder: "GTM-XXXXXXX", help: "Container ID. Vendl pushes GA4 ecommerce events to the dataLayer.", pattern: /^GTM-[A-Z0-9]{4,10}$/, extractors: [/\b(GTM-[A-Z0-9]{4,10})\b/i], caseMode: "upper", checkUrl: "https://tagassistant.google.com" },
  { key: "clarityId", label: "Microsoft Clarity", group: "analytics", placeholder: "abcd1234ef", help: "Settings → Overview → Project ID.", pattern: /^[a-z0-9]{8,12}$/, extractors: [/clarity\.ms\/tag\/([a-z0-9]{8,12})/i, /"script",\s*"([a-z0-9]{8,12})"\)/i], caseMode: "lower", checkUrl: "https://clarity.microsoft.com" },
  { key: "hotjarId", label: "Hotjar", group: "analytics", placeholder: "1234567", help: "Site ID from Sites & Organizations.", pattern: /^\d{5,10}$/, extractors: [/hjid\s*:\s*(\d{5,10})/], checkUrl: "https://insights.hotjar.com" },
  { key: "googleAdsId", label: "Google Ads tag", group: "ads", placeholder: "AW-123456789", help: "Goals → Conversions → Tag setup. You can paste AW-123456789/label.", pattern: /^AW-\d{8,12}$/, extractors: [/\b(AW-\d{8,12})\b/i], caseMode: "upper", checkUrl: "https://tagassistant.google.com" },
  { key: "googleAdsPurchaseLabel", label: "Google Ads purchase label", group: "ads", placeholder: "AbC-D_efG", help: "The part after the slash in send_to (AW-123456789/label).", pattern: /^[A-Za-z0-9_-]{6,40}$/, extractors: [/AW-\d{8,12}\/([A-Za-z0-9_-]{6,40})/i] },
  { key: "metaPixelId", label: "Meta (Facebook) Pixel", group: "ads", placeholder: "123456789012345", help: "Events Manager → Data sources → Pixel ID.", pattern: /^\d{15,16}$/, extractors: [/fbq\(\s*['"]init['"]\s*,\s*['"](\d{15,16})['"]/, /[?&]id=(\d{15,16})/], checkUrl: "https://business.facebook.com/events_manager2" },
  { key: "tiktokPixelId", label: "TikTok Pixel", group: "ads", placeholder: "CABCDEFGHIJ123456789", help: "Events Manager → Web events → Pixel ID.", pattern: /^[A-Z0-9]{20}$/, extractors: [/ttq\.load\(\s*['"]([A-Z0-9]{20})['"]/i], caseMode: "upper", checkUrl: "https://ads.tiktok.com/i18n/events_manager" },
  { key: "pinterestTagId", label: "Pinterest Tag", group: "ads", placeholder: "2612345678901", help: "Ads → Conversions → Tag ID.", pattern: /^\d{13}$/, extractors: [/pintrk\(\s*['"]load['"]\s*,\s*['"](\d{13})['"]/], checkUrl: "https://ads.pinterest.com" },
  { key: "microsoftUetId", label: "Microsoft Ads (UET)", group: "ads", placeholder: "123456789", help: "Tools → UET tag → Tag ID.", pattern: /^\d{6,10}$/, extractors: [/ti\s*:\s*["'](\d{6,10})["']/], checkUrl: "https://ads.microsoft.com" },
  { key: "snapPixelId", label: "Snapchat Pixel", group: "ads", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", help: "Events Manager → Pixel ID.", pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, extractors: [/snaptr\(\s*['"]init['"]\s*,\s*['"]([0-9a-f-]{36})['"]/i], caseMode: "lower", checkUrl: "https://business.snapchat.com" },
  { key: "linkedinPartnerId", label: "LinkedIn Insight Tag", group: "ads", placeholder: "1234567", help: "Campaign Manager → Analyze → Insight Tag → Partner ID.", pattern: /^\d{5,10}$/, extractors: [/_linkedin_partner_id\s*=\s*["'](\d{5,10})["']/], checkUrl: "https://www.linkedin.com/campaignmanager" },
  { key: "xPixelId", label: "X (Twitter) Pixel", group: "ads", placeholder: "o1abc", help: "Events Manager → Pixel ID.", pattern: /^[a-z0-9]{5,6}$/, extractors: [/twq\(\s*['"]config['"]\s*,\s*['"]([a-z0-9]{5,6})['"]/i], caseMode: "lower", checkUrl: "https://ads.x.com" },
  { key: "redditPixelId", label: "Reddit Pixel", group: "ads", placeholder: "a2_abcdefgh1234", help: "Events Manager → Pixel ID.", pattern: /^[a-z0-9_]{6,30}$/, extractors: [/rdt\(\s*['"]init['"]\s*,\s*['"]([a-z0-9_]{6,30})['"]/i], caseMode: "lower", checkUrl: "https://ads.reddit.com" },
];

export const TRACKING_FIELD_BY_KEY = new Map(TRACKING_FIELDS.map((f) => [f.key, f]));

export const TRACKING_GROUP_LABELS: Record<TrackingFieldGroup, string> = {
  verification: "Site verification",
  analytics: "Analytics",
  ads: "Ad pixels & conversion tags",
};
