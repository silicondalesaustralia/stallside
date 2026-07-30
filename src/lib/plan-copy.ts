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

export function cashPlanBlurb(currency: BillingCurrency): string {
  return currency === "AUD"
    ? "Take cash and PayID bank transfers (Australia only). Track stock. Print QR posters. Sale and low-stock alerts."
    : "Take cash at the stand. Track stock. Print QR posters. Sale and low-stock alerts.";
}

/** Extra Cash-plan note (AUD PayID). Trial messaging lives in FREE_TRIAL_BLURB. */
export function cashPlanExtraBlurb(currency: BillingCurrency): string | null {
  return currency === "AUD"
    ? "PayID (Australia only) lands in your account with no fee."
    : null;
}

/** Shared free-trial message for homepage pricing and billing. */
export const FREE_TRIAL_BLURB =
  "30-day free trial includes every Card plan feature. No card required.";

export const CARD_PLAN_BLURB =
  "Everything in Cash, plus Tap & Go - card, Apple Pay, and Google Pay at your gate. PayPal coming soon.";

export const CARD_PLAN_RESTOCK_BLURB =
  "Notify customers by email when you restock - they opt in after checkout; you never see their addresses.";

export const CARD_PLAN_HARDWARE_BLURB =
  "No terminal. No hardware. No percentage of your sales.";

export const CARD_PLAN_BILLING_BLURB =
  "Paid straight to your Stripe account.";

/** Extra Card-plan features shown on pricing (home + billing). */
export const CARD_PLAN_FEATURES = [
  "Pre-orders - customers pay to reserve, with an order-by deadline and collection day",
  "Collections - track paid pre-orders by day and mark Ready, then Collected",
  "Buyer details on pre-order - name, email, optional phone, plus a confirmation email",
  "Message customers from Collections or Orders (compose subject and body in Stallside)",
  "Optional exact pre-order slots on your public stall (e.g. “3 left”)",
  "Stand branding - your logo and colours on the stall and QR poster",
  "Social links - Instagram, Facebook, TikTok, YouTube, or your website on the stall",
] as const;
