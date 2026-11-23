import { countryFor, money } from "@/lib/seo/graph/clean";
import { gtinProperty } from "@/lib/seo/graph/product";

/** `19.99 AUD` for GMC and ChatGPT money fields. */
export function feedMoney(cents: number, currency: string): string {
  return `${money(cents)} ${currency.trim().toUpperCase()}`;
}

/** Digits-only GTIN with a valid check digit, or null. */
export function feedGtin(barcode: string | null | undefined): string | null {
  const props = gtinProperty(barcode);
  const value = Object.values(props)[0];
  return value ?? null;
}

/** Store country from the search profile, else from currency. */
export function feedCountry(
  profileCountry: string | null | undefined,
  currency: string,
): string {
  const fromProfile = profileCountry?.trim().toUpperCase();
  if (fromProfile && /^[A-Z]{2}$/.test(fromProfile)) return fromProfile;
  return countryFor(currency);
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** CSV cell: quote when needed; double embedded quotes. */
export function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function truncate(value: string, max: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}
