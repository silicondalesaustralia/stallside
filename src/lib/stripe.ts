import Stripe from "stripe";
import { appBaseUrl } from "@/lib/app-url";
import {
  BILLING_CURRENCIES,
  type BillingCurrency,
  isBillingCurrency,
} from "@/lib/saas-pricing";

export { appBaseUrl };

let stripeClient: Stripe | null = null;

/**
 * Single Stripe *platform* account powers both:
 * - Billing: owners pay Stallside (subscriptions)
 * - Connect: owners receive stand customer payments
 */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

const PRICE_ENV: Record<BillingCurrency, string> = {
  AUD: "STRIPE_PRICE_ID_CASH_AUD",
  USD: "STRIPE_PRICE_ID_CASH_USD",
  GBP: "STRIPE_PRICE_ID_CASH_GBP",
  EUR: "STRIPE_PRICE_ID_CASH_EUR",
};

/** Recurring cash-plan Price ID for a billing currency. */
export function getCashPlanPriceId(currency: BillingCurrency = "AUD"): string {
  const specific = process.env[PRICE_ENV[currency]]?.trim();
  if (specific) return specific;

  // Legacy fallback: STRIPE_PRICE_ID_CASH is the AUD price
  if (currency === "AUD") {
    const legacy = process.env.STRIPE_PRICE_ID_CASH?.trim();
    if (legacy) return legacy;
  }

  throw new Error(
    `${PRICE_ENV[currency]} is not set` +
      (currency === "AUD" ? " (or STRIPE_PRICE_ID_CASH)" : ""),
  );
}

export function tryCashPlanPriceId(currency: BillingCurrency): string | null {
  try {
    return getCashPlanPriceId(currency);
  } catch {
    return null;
  }
}

export function listConfiguredCashPlanPrices(): {
  currency: BillingCurrency;
  priceId: string;
}[] {
  return BILLING_CURRENCIES.flatMap((currency) => {
    const priceId = tryCashPlanPriceId(currency);
    return priceId ? [{ currency, priceId }] : [];
  });
}

export function isStripeBillingConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY && listConfiguredCashPlanPrices().length > 0,
  );
}

export function parseBillingCurrencyParam(
  value: FormDataEntryValue | null,
): BillingCurrency {
  const raw = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (isBillingCurrency(raw) && tryCashPlanPriceId(raw)) return raw;
  if (tryCashPlanPriceId("AUD")) return "AUD";
  const first = listConfiguredCashPlanPrices()[0];
  if (first) return first.currency;
  throw new Error("No Stripe cash-plan prices configured");
}
