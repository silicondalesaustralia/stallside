export const BILLING_CURRENCIES = ["AUD", "USD", "GBP", "EUR"] as const;

export type BillingCurrency = (typeof BILLING_CURRENCIES)[number];

/** Fixed list prices (not live FX). Per site / month. */
export const CASH_PLAN_BY_CURRENCY: Record<BillingCurrency, number> = {
  AUD: 699,
  USD: 499,
  GBP: 399,
  EUR: 499,
};

export const CARD_PLAN_BY_CURRENCY: Record<BillingCurrency, number> = {
  AUD: 1999,
  USD: 1499,
  GBP: 1199,
  EUR: 1499,
};

const REGION_TO_BILLING: Record<string, BillingCurrency> = {
  AU: "AUD",
  NZ: "AUD",
  US: "USD",
  CA: "USD",
  MX: "USD",
  GB: "GBP",
  IE: "EUR",
  AT: "EUR",
  BE: "EUR",
  DE: "EUR",
  ES: "EUR",
  FI: "EUR",
  FR: "EUR",
  IT: "EUR",
  NL: "EUR",
  PT: "EUR",
};

export function isBillingCurrency(value: string): value is BillingCurrency {
  return (BILLING_CURRENCIES as readonly string[]).includes(value);
}

export function cashPlanCents(currency: BillingCurrency): number {
  return CASH_PLAN_BY_CURRENCY[currency];
}

export function cardPlanCents(currency: BillingCurrency): number {
  return CARD_PLAN_BY_CURRENCY[currency];
}

/** Map BCP47 / region to a billing currency; unknown → AUD. */
export function billingCurrencyFromLocale(locale: string): BillingCurrency {
  const parts = locale.trim().replace("_", "-").split("-");
  const region = (parts[1] ?? parts[0] ?? "").toUpperCase();
  if (REGION_TO_BILLING[region]) return REGION_TO_BILLING[region];
  if (region === "EN") return "USD";
  return "AUD";
}

export function detectBrowserBillingCurrency(): BillingCurrency {
  if (typeof navigator === "undefined") return "AUD";
  const langs = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  for (const lang of langs) {
    if (!lang) continue;
    const mapped = billingCurrencyFromLocale(lang);
    const region = lang.replace("_", "-").split("-")[1];
    if (region) return mapped;
  }
  return billingCurrencyFromLocale(langs[0] ?? "en-AU");
}

export const BILLING_CURRENCY_STORAGE_KEY = "stallside_billing_currency";
