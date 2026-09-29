import type { BillingCurrency } from "@/lib/saas-pricing";

const BEFORE = [
  "Unlimited products and product options / variants (up to 3 groups, 12 choices each)",
  "Volume and bundle pricing (e.g. 2 for $9)",
  "Real stock counts, “Only N left” scarcity, and printable QR posters",
  "Product freshness notes and provenance lines",
  "Stall cart type: Product catalogue or Customer Choice (open dollar amounts)",
] as const;

/** Same payment story on every page - region called out only as examples. */
export const SHARED_PAYMENT_FEATURES = [
  "Cash self-confirmation",
  "Card / Tap & Go, Apple Pay, Google Pay, and wallets",
  "Local bank methods by region: PayID & PayTo (Australia), Pay by Bank (UK & Europe), Cash App (US)",
  "Pay-later where supported (Klarna, Zip, Affirm, and more)",
] as const;

/** @deprecated Prefer SHARED_PAYMENT_FEATURES. */
export const REGIONAL_PAYMENTS_SUMMARY = SHARED_PAYMENT_FEATURES[2];

const AFTER = [
  "Sale alerts, low-stock and out-of-stock alerts, email and push notifications",
  "Orders, inventory report, stock counts, and spreadsheet stock import / export",
  "Product status (in production, on order, seasonal, discontinued) and product search",
  "Card-demand counter",
  "Customer restock notifications",
  "Pre-orders with order-by deadlines and collection days",
  "Shopper subscriptions - weekly, fortnightly, or monthly recurring boxes",
  "Memberships with member caps and pay-in-full plans",
  "Cart upsells, pre-order add-ons, and first-order discounts",
  "Collections - Ready and Collected, buyer messaging",
  "Your own online shop with categories, shop layout, and custom product order",
  "Customer list, smart lists, and branded email campaigns",
  "Supplier logins with shared stock and a record of what you owe",
  "Notifications inbox, sales by channel, and multiple businesses",
  "QR poster editor with live preview",
  "Stall branding - logo, colours, social and website links",
] as const;

/**
 * @deprecated Payment list is region-agnostic now. Currency arg kept for call-site compatibility.
 */
export function sharedPaymentFeatures(_currency?: BillingCurrency): string[] {
  return [...SHARED_PAYMENT_FEATURES];
}

/** Non-payment features shared on Free and Pro. */
export function sharedNonPaymentFeatures(): string[] {
  return [...BEFORE, ...AFTER];
}

/** Shared Free/Pro features - payments are region-agnostic on every page. */
export function sharedPlanFeatures(_currency?: BillingCurrency): string[] {
  return [...BEFORE, ...SHARED_PAYMENT_FEATURES, ...AFTER];
}
