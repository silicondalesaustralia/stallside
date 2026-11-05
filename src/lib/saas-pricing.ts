export const BILLING_CURRENCIES = ["AUD", "USD", "GBP", "EUR"] as const;

export type BillingCurrency = (typeof BILLING_CURRENCIES)[number];

/** Homepage / billing region picker - one label per billing currency. */
export const BILLING_REGIONS: readonly {
  currency: BillingCurrency;
  label: string;
}[] = [
  { currency: "AUD", label: "Australia" },
  { currency: "USD", label: "United States" },
  { currency: "GBP", label: "United Kingdom" },
  { currency: "EUR", label: "Europe" },
] as const;

export function billingRegionLabel(currency: BillingCurrency): string {
  return (
    BILLING_REGIONS.find((r) => r.currency === currency)?.label ?? currency
  );
}

/** e.g. "United States (USD)" for Settings / Stripe Connect copy. */
export function billingRegionDisplay(
  currency: string | null | undefined,
): string {
  const raw = (currency ?? "AUD").trim().toUpperCase();
  const code: BillingCurrency = isBillingCurrency(raw) ? raw : "AUD";
  return `${billingRegionLabel(code)} (${code})`;
}

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

/** Pro billed yearly. Fixed list prices, not live FX. */
export const ANNUAL_PLAN_BY_CURRENCY: Record<BillingCurrency, number> = {
  AUD: 19999,
  USD: 14999,
  GBP: 11999,
  EUR: 14999,
};

export const BILLING_INTERVALS = ["month", "year"] as const;

export type BillingInterval = (typeof BILLING_INTERVALS)[number];

export function isBillingInterval(value: string): value is BillingInterval {
  return (BILLING_INTERVALS as readonly string[]).includes(value);
}

export function annualPlanCents(currency: BillingCurrency): number {
  return ANNUAL_PLAN_BY_CURRENCY[currency];
}

/** Owner.monthlyFeeCents for yearly subscribers, so MRR and commission estimates stay monthly. */
export function annualMonthlyEquivalentCents(currency: BillingCurrency): number {
  return Math.round(ANNUAL_PLAN_BY_CURRENCY[currency] / 12);
}

export function proIntervalFromMonthlyFee(
  monthlyFeeCents: number,
  currency: BillingCurrency,
): BillingInterval {
  return monthlyFeeCents === annualMonthlyEquivalentCents(currency) ? "year" : "month";
}

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
