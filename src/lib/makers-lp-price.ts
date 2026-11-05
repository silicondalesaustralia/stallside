import {
  annualPlanCents,
  cardPlanCents,
  type BillingCurrency,
} from "@/lib/saas-pricing";

const PREFIX: Record<BillingCurrency, string> = { AUD: "A$", USD: "US$", EUR: "€", GBP: "£" };

const EURO_COUNTRIES = new Set([
  "AT", "BE", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK",
]);

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

/** Country code for the region's currency, or null outside Australia, the US, the UK and the eurozone. */
function currencyForCountry(code: string): BillingCurrency | null {
  if (code === "AU") return "AUD";
  if (code === "US") return "USD";
  if (code === "GB") return "GBP";
  return EURO_COUNTRIES.has(code) ? "EUR" : null;
}

/** Visitor country (CDN header) first, then the browser language's region; everywhere else is USD. */
export function lpCurrencyFromRequest(country: string | null, acceptLanguage: string | null): BillingCurrency {
  const code = country?.trim().toUpperCase();
  if (code && /^[A-Z]{2}$/.test(code)) return currencyForCountry(code) ?? "USD";
  const first = acceptLanguage?.split(",")[0]?.split(";")[0]?.trim() ?? "";
  const region = first.replace("_", "-").split("-")[1]?.toUpperCase();
  return (region && currencyForCountry(region)) || "USD";
}
