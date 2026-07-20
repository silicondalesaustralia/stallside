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
    ? "Take cash and PayID bank transfers. Track stock. Print QR posters. Sale and low-stock alerts."
    : "Take cash at the stand. Track stock. Print QR posters. Sale and low-stock alerts.";
}

export function cashPlanTrialBlurb(currency: BillingCurrency): string {
  return currency === "AUD"
    ? "30-day free trial. PayID lands in your account with no fee."
    : "30-day free trial.";
}

export const CARD_PLAN_BLURB =
  "Everything in Cash, plus Tap & Go — card, Apple Pay, and Google Pay at your gate. PayPal coming soon.";

export const CARD_PLAN_HARDWARE_BLURB =
  "No terminal. No hardware. No percentage of your sales.";

export const CARD_PLAN_BILLING_BLURB =
  "Paid straight to your Stripe account.";
