import type { PaymentBrand } from "@/components/PaymentBrandIcon";
import { stripeCheckoutBrandsForCurrency } from "@/lib/payment-brand-assets";
import type { BillingCurrency } from "@/lib/saas-pricing";
import { sharedPlanFeatures } from "@/lib/shared-plan-features";

export {
  sharedPaymentFeatures,
  sharedPlanFeatures,
} from "@/lib/shared-plan-features";

export function cashPaymentBrands(currency: BillingCurrency): PaymentBrand[] {
  return currency === "AUD" ? ["cash", "payid"] : ["cash"];
}

export function cardPaymentBrands(currency: BillingCurrency): PaymentBrand[] {
  return currency === "AUD"
    ? ["cash", "payid", ...stripeCheckoutBrandsForCurrency("AUD")]
    : ["cash", ...stripeCheckoutBrandsForCurrency(currency)];
}

/** Free plan fee note (card / Tap & Go only). */
export const FREE_PLAN_FEE_BLURB =
  "A 2.5% Vendl fee applies to card, wallets and pay-later payments. Standard Stripe processing fees apply separately. Cash and local bank payments remain free.";

/** Absorb vs pass-on - Free only (Pro has no Vendl fee). */
export const FREE_PLAN_PASS_FEE_FEATURE =
  "Absorb the Vendl fee or pass it on to customers at checkout from Settings → Card / Tap & Go";

/** Free ($0/mo) blurb. */
export function cashPlanBlurb(currency: BillingCurrency): string {
  return currency === "AUD"
    ? "Every Vendl feature, with no monthly fee. A 2.5% Vendl fee applies to card, Tap & Go and pay-later; cash and PayID stay free. Absorb or pass on that fee."
    : "Every Vendl feature, with no monthly fee. A 2.5% Vendl fee applies to card, Tap & Go and pay-later; cash stays free. Absorb or pass on that fee.";
}

export function cashPlanExtraBlurb(currency: BillingCurrency): string | null {
  return currency === "AUD"
    ? "PayID (Australia only) lands in your account with no Vendl fee."
    : null;
}

/** @deprecated Prefer FREE_PLAN_FEE_BLURB / STARTER_PLAN_BLURB. */
export const FREE_TRIAL_BLURB =
  "Free is $0/mo with every feature. Vendl fee 2.5% on card, Tap & Go, and pay-later. Upgrade to Pro anytime to remove that fee.";

export const STARTER_PLAN_BLURB =
  "Every Vendl feature, with no monthly fee.";

export const CARD_PLAN_BLURB =
  "Remove the Vendl transaction fee and pay one predictable monthly price.";

export const CARD_PLAN_RESTOCK_BLURB =
  "Notify customers by email when you restock - they opt in after checkout; you never see their addresses.";

export const CARD_PLAN_HARDWARE_BLURB =
  "No terminal. No hardware. No Vendl cut on card sales.";

export const CARD_PLAN_BILLING_BLURB =
  "Paid directly to your connected Stripe account. Standard Stripe processing fees still apply.";

/** Fee-focused bullets on the Free pricing card. */
const FREE_FEE_FEATURES_CORE = [
  "Cash at the stand - customer self-confirms",
  "Tap & Go - card, Apple Pay and Google Pay",
  "Pay-later payments where supported",
  "2.5% Vendl fee on successful card, Tap & Go and pay-later payments",
  "Standard Stripe processing fees apply separately",
  FREE_PLAN_PASS_FEE_FEATURE,
] as const;

const FREE_PAYID_FEATURE =
  "PayID bank transfer - Australia only, with no Vendl fee" as const;

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

/** @deprecated Prefer sharedPlanFeatures(currency). Default Australia. */
export const SHARED_PLAN_FEATURES = sharedPlanFeatures("AUD");

/** @deprecated Prefer sharedPlanFeatures for marketing. */
export const CARD_PLAN_FEATURES = [
  "Pre-orders - customers pay to reserve, with an order-by deadline and collection day",
  "Collections - track paid pre-orders by day and mark Ready, then Collected",
  "Buyer details on pre-order - name, email, optional phone, plus a confirmation email",
  "Message customers from Collections or Orders (compose subject and body in Vendl)",
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
