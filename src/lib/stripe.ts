import Stripe from "stripe";
import { appBaseUrl } from "@/lib/app-url";
import { cleanEnvSecret } from "@/lib/env";
import {
  BILLING_CURRENCIES,
  type BillingCurrency,
  isBillingCurrency,
} from "@/lib/saas-pricing";

export { appBaseUrl, cleanEnvSecret };

let stripeClient: Stripe | null = null;

/**
 * Single Stripe *platform* account powers both:
 * - Billing: owners pay Stallside (Pro subscription)
 * - Connect: owners receive stand customer payments
 */
export function getStripe(): Stripe {
  const key = cleanEnvSecret(process.env.STRIPE_SECRET_KEY);
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (/[^\x20-\x7E]/.test(key)) {
    throw new Error(
      "STRIPE_SECRET_KEY has invalid characters - remove quotes/newlines in Vercel env",
    );
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return Boolean(cleanEnvSecret(process.env.STRIPE_SECRET_KEY));
}

export type SaasPlan = "free" | "pro";

/**
 * Static process.env.NAME reads only — Next/Vercel do not resolve
 * process.env[dynamicKey] for server bundles the same way as local Node.
 */
function proPriceEnv(currency: BillingCurrency): string | undefined {
  switch (currency) {
    case "AUD":
      return process.env.STRIPE_PRICE_ID_PRO_AUD;
    case "USD":
      return process.env.STRIPE_PRICE_ID_PRO_USD;
    case "GBP":
      return process.env.STRIPE_PRICE_ID_PRO_GBP;
    case "EUR":
      return process.env.STRIPE_PRICE_ID_PRO_EUR;
  }
}

function cardPriceEnv(currency: BillingCurrency): string | undefined {
  switch (currency) {
    case "AUD":
      return process.env.STRIPE_PRICE_ID_CARD_AUD;
    case "USD":
      return process.env.STRIPE_PRICE_ID_CARD_USD;
    case "GBP":
      return process.env.STRIPE_PRICE_ID_CARD_GBP;
    case "EUR":
      return process.env.STRIPE_PRICE_ID_CARD_EUR;
  }
}

function cashPriceEnv(currency: BillingCurrency): string | undefined {
  switch (currency) {
    case "AUD":
      return process.env.STRIPE_PRICE_ID_CASH_AUD;
    case "USD":
      return process.env.STRIPE_PRICE_ID_CASH_USD;
    case "GBP":
      return process.env.STRIPE_PRICE_ID_CASH_GBP;
    case "EUR":
      return process.env.STRIPE_PRICE_ID_CASH_EUR;
  }
}

export function getCashPlanPriceId(currency: BillingCurrency = "AUD"): string {
  const specific = cleanEnvSecret(cashPriceEnv(currency));
  if (specific) return specific;
  if (currency === "AUD") {
    const legacy = cleanEnvSecret(process.env.STRIPE_PRICE_ID_CASH);
    if (legacy) return legacy;
  }
  throw new Error(
    `STRIPE_PRICE_ID_CASH_${currency} is not set` +
      (currency === "AUD" ? " (or STRIPE_PRICE_ID_CASH)" : ""),
  );
}

export function getProPlanPriceId(currency: BillingCurrency = "AUD"): string {
  const pro = cleanEnvSecret(proPriceEnv(currency));
  if (pro) return pro;
  const card = cleanEnvSecret(cardPriceEnv(currency));
  if (card) return card;
  throw new Error(
    `STRIPE_PRICE_ID_PRO_${currency} (or STRIPE_PRICE_ID_CARD_${currency}) is not set`,
  );
}

/** @deprecated Use getProPlanPriceId */
export function getCardPlanPriceId(currency: BillingCurrency = "AUD"): string {
  return getProPlanPriceId(currency);
}

export function tryCashPlanPriceId(currency: BillingCurrency): string | null {
  try {
    return getCashPlanPriceId(currency);
  } catch {
    return null;
  }
}

export function tryProPlanPriceId(currency: BillingCurrency): string | null {
  try {
    return getProPlanPriceId(currency);
  } catch {
    return null;
  }
}

/** @deprecated Use tryProPlanPriceId */
export function tryCardPlanPriceId(currency: BillingCurrency): string | null {
  return tryProPlanPriceId(currency);
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

export function listConfiguredProPlanPrices(): {
  currency: BillingCurrency;
  priceId: string;
}[] {
  return BILLING_CURRENCIES.flatMap((currency) => {
    const priceId = tryProPlanPriceId(currency);
    return priceId ? [{ currency, priceId }] : [];
  });
}

/** @deprecated Use listConfiguredProPlanPrices */
export function listConfiguredCardPlanPrices() {
  return listConfiguredProPlanPrices();
}

export function isStripeBillingConfigured(): boolean {
  return Boolean(
    cleanEnvSecret(process.env.STRIPE_SECRET_KEY) &&
      listConfiguredProPlanPrices().length > 0,
  );
}

export function isStripeProBillingConfigured(): boolean {
  return isStripeBillingConfigured();
}

/** @deprecated Use isStripeProBillingConfigured */
export function isStripeCardBillingConfigured(): boolean {
  return isStripeProBillingConfigured();
}

/** Resolve SaaS plan from subscription metadata or known Price IDs. */
export function saasPlanFromSubscription(subscription: {
  metadata?: Stripe.Metadata | null;
  items: { data: Array<{ price: { id: string } }> };
}): SaasPlan {
  const meta = (subscription.metadata?.saasPlan ?? "").trim().toLowerCase();
  if (meta === "pro" || meta === "card" || meta === "card_paypal" || meta === "pro_paypal") {
    return "pro";
  }
  if (meta === "cash" || meta === "starter" || meta === "free") return "free";

  const priceId = subscription.items.data[0]?.price.id;
  if (priceId) {
    for (const currency of BILLING_CURRENCIES) {
      if (tryProPlanPriceId(currency) === priceId) return "pro";
      if (tryCashPlanPriceId(currency) === priceId) return "free";
    }
  }
  return "free";
}

export function parseBillingCurrencyParam(
  value: FormDataEntryValue | null,
  _plan: SaasPlan = "pro",
): BillingCurrency {
  const raw = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (isBillingCurrency(raw) && tryProPlanPriceId(raw)) return raw;
  if (tryProPlanPriceId("AUD")) return "AUD";
  const first = listConfiguredProPlanPrices()[0];
  if (first) return first.currency;
  throw new Error("No Stripe Pro plan prices configured");
}
