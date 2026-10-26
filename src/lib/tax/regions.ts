/**
 * How sales tax works per country. `inclusive`: shelf prices already include the tax (it's worked
 * back out of each sale). Otherwise the tax is added on top at checkout (US, Canada).
 * `defaultRateBps` null means the owner must enter their own rate (it varies by state/province).
 */
export type TaxRegion = {
  country: string;
  label: string;
  name: string;
  defaultRateBps: number | null;
  inclusive: boolean;
  idLabel: string;
};

export const TAX_REGIONS: TaxRegion[] = [
  { country: "AU", label: "Australia", name: "GST", defaultRateBps: 1000, inclusive: true, idLabel: "ABN" },
  { country: "NZ", label: "New Zealand", name: "GST", defaultRateBps: 1500, inclusive: true, idLabel: "GST number" },
  { country: "GB", label: "United Kingdom", name: "VAT", defaultRateBps: 2000, inclusive: true, idLabel: "VAT number" },
  { country: "IE", label: "Ireland", name: "VAT", defaultRateBps: 2300, inclusive: true, idLabel: "VAT number" },
  { country: "DE", label: "Germany", name: "VAT", defaultRateBps: 1900, inclusive: true, idLabel: "VAT number" },
  { country: "FR", label: "France", name: "VAT", defaultRateBps: 2000, inclusive: true, idLabel: "VAT number" },
  { country: "NL", label: "Netherlands", name: "VAT", defaultRateBps: 2100, inclusive: true, idLabel: "VAT number" },
  { country: "ES", label: "Spain", name: "VAT", defaultRateBps: 2100, inclusive: true, idLabel: "VAT number" },
  { country: "IT", label: "Italy", name: "VAT", defaultRateBps: 2200, inclusive: true, idLabel: "VAT number" },
  { country: "SG", label: "Singapore", name: "GST", defaultRateBps: 900, inclusive: true, idLabel: "GST reg. number" },
  { country: "US", label: "United States", name: "Sales tax", defaultRateBps: null, inclusive: false, idLabel: "Sales tax permit" },
  { country: "CA", label: "Canada", name: "GST/HST", defaultRateBps: null, inclusive: false, idLabel: "GST/HST number" },
];

const FALLBACK: Omit<TaxRegion, "country" | "label"> = {
  name: "Tax",
  defaultRateBps: null,
  inclusive: true,
  idLabel: "Tax ID",
};

export function taxRegion(country: string): TaxRegion {
  const code = country.trim().toUpperCase();
  return TAX_REGIONS.find((r) => r.country === code) ?? { country: code, label: code, ...FALLBACK };
}

/** Best-guess country for a currency, used to pre-fill the tax settings. */
export function countryForCurrency(currency: string): string | null {
  const map: Record<string, string> = {
    AUD: "AU", NZD: "NZ", GBP: "GB", USD: "US", CAD: "CA", SGD: "SG", EUR: "IE",
  };
  return map[currency.trim().toUpperCase()] ?? null;
}
