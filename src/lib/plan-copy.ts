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
  "A 2.5% Stallside fee applies to card, Tap & Go and pay-later payments. Standard Stripe processing fees apply separately. Cash and PayID remain free.";

/** Absorb vs pass-on - Free only (Pro has no Stallside fee). */
export const FREE_PLAN_PASS_FEE_FEATURE =
  "Absorb the Stallside fee or pass it on to customers at checkout from Settings → Card / Tap & Go";

/** Free ($0/mo) blurb. */
export function cashPlanBlurb(currency: BillingCurrency): string {
  return currency === "AUD"
    ? "Every Stallside feature, with no monthly fee. A 2.5% Stallside fee applies to card, Tap & Go and pay-later; cash and PayID stay free. Absorb or pass on that fee."
    : "Every Stallside feature, with no monthly fee. A 2.5% Stallside fee applies to card, Tap & Go and pay-later; cash stays free. Absorb or pass on that fee.";
}

export function cashPlanExtraBlurb(currency: BillingCurrency): string | null {
  return currency === "AUD"
    ? "PayID (Australia only) lands in your account with no Stallside fee."
    : null;
}

/** @deprecated Prefer FREE_PLAN_FEE_BLURB / STARTER_PLAN_BLURB. */
export const FREE_TRIAL_BLURB =
  "Free is $0/mo with every feature. Stallside fee 2.5% on card, Tap & Go, and pay-later. Upgrade to Pro anytime to remove that fee.";

export const STARTER_PLAN_BLURB =
  "Every Stallside feature, with no monthly fee.";

export const CARD_PLAN_BLURB =
  "Remove the Stallside transaction fee and pay one predictable monthly price.";

export const CARD_PLAN_RESTOCK_BLURB =
  "Notify customers by email when you restock - they opt in after checkout; you never see their addresses.";

export const CARD_PLAN_HARDWARE_BLURB =
  "No terminal. No hardware. No Stallside cut on card sales.";

export const CARD_PLAN_BILLING_BLURB =
  "Paid directly to your connected Stripe account. Standard Stripe processing fees still apply.";

export const PRO_BREAK_EVEN_BLURB =
  "Best for active stalls processing around A$800 or more in card sales each month.";

/** Fee-focused bullets on the Free pricing card. */
const FREE_FEE_FEATURES_CORE = [
  "Cash at the stand — customer self-confirms",
  "Tap & Go — card, Apple Pay and Google Pay",
  "Pay-later payments where supported",
  "2.5% Stallside fee on successful card, Tap & Go and pay-later payments",
  "Standard Stripe processing fees apply separately",
  FREE_PLAN_PASS_FEE_FEATURE,
] as const;

const FREE_PAYID_FEATURE =
  "PayID bank transfer — Australia only, with no Stallside fee" as const;

/** Free fee/payment bullets for pricing cards - PayID only when region is Australia. */
export function starterPlanFeatures(
  currency: BillingCurrency,
): readonly string[] {
  if (currency === "AUD") {
    return [
      FREE_FEE_FEATURES_CORE[0],
      FREE_PAYID_FEATURE,
      ...FREE_FEE_FEATURES_CORE.slice(1),
    ];
  }
  return FREE_FEE_FEATURES_CORE;
}

/** Shared product features (Free and Pro) - shown once below pricing cards. */
export const SHARED_PLAN_FEATURES = [
  "Unlimited products and product options / variants",
  "Real stock counts and printable QR posters",
  "Cash self-confirmation",
  "PayID in Australia",
  "Tap & Go card payments, Apple Pay and Google Pay",
  "Sale alerts, low-stock alerts, email and push notifications",
  "Orders and inventory dashboard",
  "Card-demand counter",
  "Customer restock notifications",
  "Pre-orders with order-by deadlines and collection days",
  "Collections — Ready and Collected, buyer messaging",
  "Stall branding — logo, colours, social and website links",
] as const;

/** @deprecated Prefer SHARED_PLAN_FEATURES for marketing. */
export const CARD_PLAN_FEATURES = [
  "Pre-orders - customers pay to reserve, with an order-by deadline and collection day",
  "Collections - track paid pre-orders by day and mark Ready, then Collected",
  "Buyer details on pre-order - name, email, optional phone, plus a confirmation email",
  "Message customers from Collections or Orders (compose subject and body in Stallside)",
  "Optional exact pre-order slots on your public stall (e.g. “3 left”)",
  "Stand branding - your logo and colours on the stall and QR poster",
  "Social links - Instagram, Facebook, TikTok, YouTube, or your website on the stall",
] as const;

/** Default list (Australia) for static marketing columns. */
export const STARTER_PLAN_FEATURES = starterPlanFeatures("AUD");

/** Aliases for Free / Pro naming. */
export const FREE_PLAN_BLURB = STARTER_PLAN_BLURB;
export const freePlanFeatures = starterPlanFeatures;
export const FREE_PLAN_FEATURES = STARTER_PLAN_FEATURES;
export const PRO_PLAN_BLURB = CARD_PLAN_BLURB;
export const PRO_PLAN_FEATURES = CARD_PLAN_FEATURES;
