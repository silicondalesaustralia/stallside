import {
  annualPlanCents,
  billingCurrencyFromLocale,
  cardPlanCents,
  type BillingCurrency,
} from "@/lib/saas-pricing";

const PREFIX: Record<BillingCurrency, string> = { AUD: "A$", USD: "US$", EUR: "€", GBP: "£" };

const AUD_COUNTRIES = new Set(["AU", "NZ"]);

export function lpCurrencySymbol(currency: BillingCurrency): string {
  return PREFIX[currency];
}

/** Unambiguous fixed price, e.g. A$19.99, US$14.99, £0. */
export function formatLpPrice(cents: number, currency: BillingCurrency): string {
  const amount = cents / 100;
  return `${PREFIX[currency]}${cents % 100 === 0 ? amount.toFixed(0) : amount.toFixed(2)}`;
}

export function lpProMonthly(currency: BillingCurrency): string {
  return formatLpPrice(cardPlanCents(currency), currency);
}

export function lpProAnnual(currency: BillingCurrency): string {
  return formatLpPrice(annualPlanCents(currency), currency);
}

/** e.g. "Works out to A$16.67 a month. Save A$39.89 a year." */
export function lpAnnualNote(currency: BillingCurrency): string {
  const annual = annualPlanCents(currency);
  const perMonth = formatLpPrice(Math.round(annual / 12), currency);
  const saving = formatLpPrice(cardPlanCents(currency) * 12 - annual, currency);
  return `Works out to ${perMonth} a month. Save ${saving} a year.`;
}

/** Visitor country (CDN header) first, then the browser language; non-AU/NZ visitors never default to AUD. */
export function lpCurrencyFromRequest(country: string | null, acceptLanguage: string | null): BillingCurrency {
  const code = country?.trim().toUpperCase();
  if (code && /^[A-Z]{2}$/.test(code)) {
    const mapped = billingCurrencyFromLocale(`en-${code}`);
    return mapped === "AUD" && !AUD_COUNTRIES.has(code) ? "USD" : mapped;
  }
  const first = acceptLanguage?.split(",")[0]?.split(";")[0]?.trim();
  return first ? billingCurrencyFromLocale(first) : "AUD";
}
