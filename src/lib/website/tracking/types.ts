export const TRACKING_ID_KEYS = [
  "gscVerification",
  "bingVerification",
  "metaDomainVerification",
  "pinterestDomainVerify",
  "ga4Id",
  "gtmId",
  "googleAdsId",
  "googleAdsPurchaseLabel",
  "metaPixelId",
  "tiktokPixelId",
  "pinterestTagId",
  "microsoftUetId",
  "snapPixelId",
  "linkedinPartnerId",
  "xPixelId",
  "redditPixelId",
  "clarityId",
  "hotjarId",
] as const;

export type TrackingIdKey = (typeof TRACKING_ID_KEYS)[number];

export type TrackingIds = Partial<Record<TrackingIdKey, string>>;

/** off = no banner; eu = banner for EU/EEA/UK/CH visitors only; all = banner for everyone. */
export type TrackingConsentMode = "off" | "eu" | "all";

export type StorefrontTracking = {
  ids: TrackingIds;
  consentMode: TrackingConsentMode;
  /** Adds an "Analytics and advertising" section to the built-in privacy page. */
  privacyNotice: boolean;
  /** Raw custom head code; only <script> and <meta> tags are used. */
  customHead: string;
  updatedAt?: string;
};

export const DEFAULT_STOREFRONT_TRACKING: StorefrontTracking = {
  ids: {},
  consentMode: "eu",
  privacyNotice: true,
  customHead: "",
};

export type CustomHeadScript = { src?: string; inline?: string; async: boolean };

export type CustomHeadMeta = { name: string; content: string };

/** What the storefront runtime needs; everything here is public. */
export type PublicTagsConfig = {
  ids: TrackingIds;
  consentMode: TrackingConsentMode;
  customScripts: CustomHeadScript[];
  euVisitor: boolean;
  debug: boolean;
  privacyHref: string;
};
