import { taxRegion } from "./regions";

export type TaxOwner = { gstRegistered: boolean; taxCountry: string | null; taxRateBps: number | null };

/** Everything the site needs to know about an owner's sales tax, resolved once. */
export type TaxConfig = {
  /** Tax is collected/recorded on sales. */
  applies: boolean;
  country: string | null;
  name: string;
  rateBps: number;
  inclusive: boolean;
  idLabel: string;
};

/** The math part of a config; null when no tax applies. */
export type TaxRule = { rateBps: number; inclusive: boolean };

/**
 * Owners who never saved tax settings keep the old behaviour: Australian GST when they trade in
 * AUD and are registered, otherwise no tax.
 */
export function taxConfig(owner: TaxOwner, currency: string): TaxConfig {
  const country = owner.taxCountry ?? (currency.trim().toUpperCase() === "AUD" ? "AU" : null);
  const region = taxRegion(country ?? "");
  const rateBps = owner.taxRateBps ?? region.defaultRateBps ?? 0;
  return {
    applies: Boolean(country) && owner.gstRegistered && rateBps > 0,
    country,
    name: region.name,
    rateBps,
    inclusive: region.inclusive,
    idLabel: region.idLabel,
  };
}

export function taxRule(config: TaxConfig): TaxRule | null {
  return config.applies ? { rateBps: config.rateBps, inclusive: config.inclusive } : null;
}

/** "10%", "8.25%". */
export function formatTaxRate(rateBps: number): string {
  return `${Number((rateBps / 100).toFixed(3))}%`;
}

/** Tax name for reports: the owner's name when they collect tax, otherwise a neutral "Tax". */
export function taxLabel(config: TaxConfig): string {
  return config.applies ? config.name : "Tax";
}
