import { gstApplies } from "@/lib/gst";

/** `recoverable`: registered businesses usually claim this tax back on supplies, so it isn't a real cost. */
export type TaxRegion = { label: string; recoverable: boolean };

const GST_CURRENCIES = new Set(["AUD", "NZD", "SGD", "INR", "MYR"]);
const VAT_CURRENCIES = new Set([
  "GBP", "EUR", "CHF", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "RON", "BGN", "ISK", "ZAR", "AED", "MXN", "BRL",
]);

/** Purchase-tax regime inferred from the business currency (the only region signal every stand has). */
export function taxRegionForCurrency(currency: string): TaxRegion {
  const code = currency.trim().toUpperCase();
  if (code === "USD") return { label: "sales tax", recoverable: false };
  if (code === "CAD") return { label: "GST/HST", recoverable: true };
  if (code === "JPY") return { label: "consumption tax", recoverable: true };
  if (GST_CURRENCIES.has(code)) return { label: "GST", recoverable: true };
  if (VAT_CURRENCIES.has(code)) return { label: "VAT", recoverable: true };
  return { label: "tax", recoverable: true };
}

/**
 * Starting cost basis for scanned lines. Only Australian GST has a saved registration setting;
 * elsewhere owners switch to ex-tax on the review screen when they're registered.
 */
export function defaultCostBasis(owner: { gstRegistered: boolean }, currency: string): "ex-tax" | "inc-tax" {
  return gstApplies(owner, currency) ? "ex-tax" : "inc-tax";
}
