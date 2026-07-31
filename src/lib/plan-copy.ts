import type { PaymentBrand } from "@/components/PaymentBrandIcon";
import type { BillingCurrency } from "@/lib/saas-pricing";

export function cashPaymentBrands(currency: BillingCurrency): PaymentBrand[] {
  return currency === "AUD" ? ["cash", "payid"] : ["cash"];
}

export function cardPaymentBrands(currency: BillingCurrency): PaymentBrand[] {
  return currency === "AUD"
    ? ["cash", "payid", "card", "apple", "google"]
    : ["cash", "card", "apple", "google"];
}

/** Starter (free forever) blurb. */
export function cashPlanBlurb(currency: BillingCurrency): string {
  return currency === "AUD"
    ? "Free forever. Take cash and PayID, track stock, print QR posters, sale and low-stock alerts, product options."
    : "Free forever. Take cash at the stand, track stock, print QR posters, sale and low-stock alerts, product options.";
}

export function cashPlanExtraBlurb(currency: BillingCurrency): string | null {
  return currency === "AUD"
    ? "PayID (Australia only) lands in your account with no fee."
    : null;
}

/** @deprecated Prefer starter wording - kept for call sites during rename. */
export const FREE_TRIAL_BLURB =
  "30-day Pro free trial includes every Pro feature. No card required. Then Starter stays free forever.";

export const STARTER_PLAN_BLURB =
  "Free forever. Cash and PayID (AU), unlimited products and options, stock, QR posters, alerts.";

export const CARD_PLAN_BLURB =
  "Everything in Starter, plus Tap & Go on Pro - card, Apple Pay, and Google Pay at your gate. PayPal coming soon.";

export const CARD_PLAN_RESTOCK_BLURB =
  "Notify customers by email when you restock - they opt in after checkout; you never see their addresses.";

export const CARD_PLAN_HARDWARE_BLURB =
  "No terminal. No hardware. No percentage of your sales.";

export const CARD_PLAN_BILLING_BLURB =
  "Paid straight to your Stripe account.";

/** Pro-only features shown on pricing (home + billing). */
export const CARD_PLAN_FEATURES = [
  "Pre-orders - customers pay to reserve, with an order-by deadline and collection day",
  "Collections - track paid pre-orders by day and mark Ready, then Collected",
  "Buyer details on pre-order - name, email, optional phone, plus a confirmation email",
  "Message customers from Collections or Orders (compose subject and body in Stallside)",
  "Optional exact pre-order slots on your public stall (e.g. “3 left”)",
  "Stand branding - your logo and colours on the stall and QR poster",
  "Social links - Instagram, Facebook, TikTok, YouTube, or your website on the stall",
] as const;

const STARTER_FEATURES_CORE = [
  "Cash at the stand (customer self-confirms)",
  "Unlimited products and product options / variants",
  "Real stock counts and printable QR posters",
  "Sale alerts and low-stock alerts (email / push)",
  "Orders and inventory dashboard",
  "Card-demand counter - see how many shoppers wanted to pay by card",
] as const;

const STARTER_PAYID_FEATURE =
  "PayID bank transfer (Australia only)" as const;

/** Starter bullets for pricing - PayID only when region is Australia. */
export function starterPlanFeatures(
  currency: BillingCurrency,
): readonly string[] {
  if (currency === "AUD") {
    return [
      STARTER_FEATURES_CORE[0],
      STARTER_PAYID_FEATURE,
      ...STARTER_FEATURES_CORE.slice(1),
    ];
  }
  return STARTER_FEATURES_CORE;
}

/** Default list (Australia) for static marketing columns. */
export const STARTER_PLAN_FEATURES = starterPlanFeatures("AUD");

/** Aliases for new naming. */
export const PRO_PLAN_BLURB = CARD_PLAN_BLURB;
export const PRO_PLAN_FEATURES = CARD_PLAN_FEATURES;
