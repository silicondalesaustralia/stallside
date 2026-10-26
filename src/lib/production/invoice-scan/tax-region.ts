import { taxConfig, type TaxOwner } from "@/lib/tax/config";

/** `recoverable`: registered businesses usually claim this tax back on supplies, so it isn't a real cost. */
export type TaxRegion = { label: string; recoverable: boolean };

const GST_CURRENCIES = new Set(["AUD", "NZD", "SGD", "INR", "MYR"]);
const VAT_CURRENCIES = new Set([
  "GBP", "EUR", "CHF", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "RON", "BGN", "ISK", "ZAR", "AED", "MXN", "BRL",
]);

/** Purchase-tax regime inferred from the business currency, for owners without tax settings. */
export function taxRegionForCurrency(currency: string): TaxRegion {
  const code = currency.trim().toUpperCase();
  if (code === "USD") return { label: "sales tax", recoverable: false };
  if (code === "CAD") return { label: "GST/HST", recoverable: true };
  if (code === "JPY") return { label: "consumption tax", recoverable: true };
  if (GST_CURRENCIES.has(code)) return { label: "GST", recoverable: true };
  if (VAT_CURRENCIES.has(code)) return { label: "VAT", recoverable: true };
  return { label: "tax", recoverable: true };
}

/** The owner's saved tax country wins; US sales tax on supplies is a real cost, everything else is claimable. */
export function scanTaxRegion(owner: TaxOwner, currency: string): TaxRegion {
  const config = taxConfig(owner, currency);
  if (!config.country) return taxRegionForCurrency(currency);
  return { label: config.country === "US" ? "sales tax" : config.name, recoverable: config.country !== "US" };
}

/** Registered owners in claim-back regions start on ex-tax costs. */
export function defaultCostBasis(owner: TaxOwner, currency: string): "ex-tax" | "inc-tax" {
  const config = taxConfig(owner, currency);
  return config.applies && config.country !== "US" ? "ex-tax" : "inc-tax";
}
