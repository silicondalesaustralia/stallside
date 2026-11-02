import type { StorefrontTracking, TrackingIdKey } from "./types";

export type PrivacyProvider = { name: string; purpose: "analytics" | "advertising"; policyUrl: string };

const PROVIDERS: Partial<Record<TrackingIdKey, PrivacyProvider>> = {
  ga4Id: { name: "Google Analytics", purpose: "analytics", policyUrl: "https://policies.google.com/privacy" },
  gtmId: { name: "Google Tag Manager", purpose: "analytics", policyUrl: "https://policies.google.com/privacy" },
  googleAdsId: { name: "Google Ads", purpose: "advertising", policyUrl: "https://policies.google.com/technologies/ads" },
  metaPixelId: { name: "Meta Pixel (Facebook & Instagram)", purpose: "advertising", policyUrl: "https://www.facebook.com/privacy/policy" },
  tiktokPixelId: { name: "TikTok Pixel", purpose: "advertising", policyUrl: "https://www.tiktok.com/legal/privacy-policy" },
  pinterestTagId: { name: "Pinterest Tag", purpose: "advertising", policyUrl: "https://policy.pinterest.com/privacy-policy" },
  microsoftUetId: { name: "Microsoft Advertising", purpose: "advertising", policyUrl: "https://privacy.microsoft.com/privacystatement" },
  snapPixelId: { name: "Snap Pixel", purpose: "advertising", policyUrl: "https://values.snap.com/privacy/privacy-policy" },
  linkedinPartnerId: { name: "LinkedIn Insight Tag", purpose: "advertising", policyUrl: "https://www.linkedin.com/legal/privacy-policy" },
  xPixelId: { name: "X (Twitter) Pixel", purpose: "advertising", policyUrl: "https://x.com/privacy" },
  redditPixelId: { name: "Reddit Pixel", purpose: "advertising", policyUrl: "https://www.reddit.com/policies/privacy-policy" },
  clarityId: { name: "Microsoft Clarity", purpose: "analytics", policyUrl: "https://privacy.microsoft.com/privacystatement" },
  hotjarId: { name: "Hotjar", purpose: "analytics", policyUrl: "https://www.hotjar.com/legal/policies/privacy/" },
};

/** Providers that set cookies or collect visit data (verification-only tags are left out). */
export function enabledPrivacyProviders(tracking: StorefrontTracking): PrivacyProvider[] {
  const seen = new Set<string>();
  const out: PrivacyProvider[] = [];
  for (const key of Object.keys(tracking.ids) as TrackingIdKey[]) {
    const provider = PROVIDERS[key];
    if (provider && !seen.has(provider.name)) {
      seen.add(provider.name);
      out.push(provider);
    }
  }
  return out;
}
