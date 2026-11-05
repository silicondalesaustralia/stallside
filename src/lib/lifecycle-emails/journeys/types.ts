/** Owner signals used to skip introductions to tools the owner already uses. */
export type AdoptionKey =
  | "paymentsConnected"
  | "preOrdersOrSubscriptions"
  | "costingUsed"
  | "pricingUsed"
  | "websitePublished"
  | "socialConnected"
  | "videoUsed";

export type Adoption = Record<AdoptionKey, boolean>;

/**
 * Email body block. Strings are paragraphs ("**bold**" supported; tokens {name}, {fee_sales},
 * {fee_saving}). `dfy` blocks only render while the Done-For-You website service is live.
 */
export type Block = string | { list: string[]; ordered?: boolean } | { button: true } | { dfy: Block[] };

export type JourneyEmail = {
  key: string;
  day: number;
  subject: string;
  /** Path under the app (e.g. /dashboard/payments) or an absolute URL; null = reply is the action. */
  cta: { label: string; path: string } | null;
  body: Block[];
  skipWhen?: AdoptionKey;
  /** Whole email depends on the Done-For-You service. */
  requiresDfy?: boolean;
};

export type JourneyId = "free" | "recovery" | "pro";
