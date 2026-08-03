import type { PaymentBrand } from "@/components/PaymentBrandIcon";
import { STRIPE_CHECKOUT_BRANDS } from "@/lib/payment-brand-assets";
import type { BillingCurrency } from "@/lib/saas-pricing";

export function cashPaymentBrands(currency: BillingCurrency): PaymentBrand[] {
  return currency === "AUD" ? ["cash", "payid"] : ["cash"];
}

export function cardPaymentBrands(currency: BillingCurrency): PaymentBrand[] {
  return currency === "AUD"
    ? ["cash", "payid", ...STRIPE_CHECKOUT_BRANDS]
    : ["cash", ...STRIPE_CHECKOUT_BRANDS];
}

/** Free plan fee note (card / Tap & Go only). */
export const FREE_PLAN_FEE_BLURB =
  "Stallside fee 2.5% + 30¢ on card, Tap & Go, and pay-later on all transactions. Cash and PayID always free.";

/** Free ($0/mo) blurb. */
export function cashPlanBlurb(currency: BillingCurrency): string {
  return currency === "AUD"
    ? "Free forever. All features - cash, PayID, Tap & Go, pre-orders, branding, and more. Stallside fee 2.5% + 30¢ on card, Tap & Go, and pay-later on all transactions; cash and PayID stay free."
    : "Free forever. All features - cash, Tap & Go, pre-orders, branding, and more. Stallside fee 2.5% + 30¢ on card, Tap & Go, and pay-later on all transactions; cash stays free.";
}

export function cashPlanExtraBlurb(currency: BillingCurrency): string | null {
  return currency === "AUD"
    ? "PayID (Australia only) lands in your account with no Stallside fee."
    : null;
}

/** @deprecated Prefer free wording - kept for call sites during rename. */
export const FREE_TRIAL_BLURB =
  "30-day Pro free trial: no Stallside card fee - keep 100% of your sales. No card required. Then Free stays $0/mo with the card fee unless you upgrade.";

export const STARTER_PLAN_BLURB =
  "Free forever. All features. Stallside fee 2.5% + 30¢ on card, Tap & Go, and pay-later on all transactions. Cash and PayID always free.";

export const CARD_PLAN_BLURB =
  "Same features as Free, with no Stallside card fee - keep 100% of your sales.";

export const CARD_PLAN_RESTOCK_BLURB =
  "Notify customers by email when you restock - they opt in after checkout; you never see their addresses.";

export const CARD_PLAN_HARDWARE_BLURB =
  "No terminal. No hardware. Keep 100% of your sales - no Stallside cut on card.";

export const CARD_PLAN_BILLING_BLURB =
  "Paid straight to your Stripe account.";

/** Shared feature list (Free and Pro). */
export const CARD_PLAN_FEATURES = [
  "Pre-orders - customers pay to reserve, with an order-by deadline and collection day",
  "Collections - track paid pre-orders by day and mark Ready, then Collected",
  "Buyer details on pre-order - name, email, optional phone, plus a confirmation email",
  "Message customers from Collections or Orders (compose subject and body in Stallside)",
  "Optional exact pre-order slots on your public stall (e.g. “3 left”)",
  "Stand branding - your logo and colours on the stall and QR poster",
  "Social links - Instagram, Facebook, TikTok, YouTube, or your website on the stall",
] as const;

const FREE_FEATURES_CORE = [
  "Cash at the stand (customer self-confirms)",
  "Tap & Go - card, Apple Pay, Google Pay (Stallside fee 2.5% + 30¢ on all transactions)",
  "Unlimited products and product options / variants",
  "Real stock counts and printable QR posters",
  "Sale alerts and low-stock alerts (email / push)",
  "Orders and inventory dashboard",
  "Card-demand counter - see how many shoppers wanted to pay by card",
] as const;

const FREE_PAYID_FEATURE =
  "PayID bank transfer (Australia only) - no Stallside fee" as const;

/** Free bullets for pricing - PayID only when region is Australia. */
export function starterPlanFeatures(
  currency: BillingCurrency,
): readonly string[] {
  if (currency === "AUD") {
    return [
      FREE_FEATURES_CORE[0],
      FREE_PAYID_FEATURE,
      ...FREE_FEATURES_CORE.slice(1),
    ];
  }
  return FREE_FEATURES_CORE;
}

/** Default list (Australia) for static marketing columns. */
export const STARTER_PLAN_FEATURES = starterPlanFeatures("AUD");

/** Aliases for Free / Pro naming. */
export const FREE_PLAN_BLURB = STARTER_PLAN_BLURB;
export const freePlanFeatures = starterPlanFeatures;
export const FREE_PLAN_FEATURES = STARTER_PLAN_FEATURES;
export const PRO_PLAN_BLURB = CARD_PLAN_BLURB;
export const PRO_PLAN_FEATURES = CARD_PLAN_FEATURES;
