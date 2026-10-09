import type { BusinessMode } from "@/lib/business-mode";

export type TemplateSeller = {
  businessName: string;
  businessMode: BusinessMode;
  headline?: string | null;
  subheadline?: string | null;
  about?: string | null;
  regionLabel?: string | null;
};

const TOKEN = /\{\{\s*business\.([a-zA-Z]+)\s*\}\}/g;

function tokenValues(seller: TemplateSeller): Record<string, string> {
  const name = seller.businessName.trim();
  return {
    name,
    headline: seller.headline?.trim() || name,
    subheadline: seller.subheadline?.trim() ?? "",
    about: seller.about?.trim() ?? "",
    region: seller.regionLabel?.trim() ?? "",
  };
}

export const TEMPLATE_TOKENS = ["name", "headline", "subheadline", "about", "region"] as const;

/** Unknown tokens are left in place so the package validator can report them. */
export function fillTokens(value: string, seller: TemplateSeller): string {
  const values = tokenValues(seller);
  return value.replace(TOKEN, (match, key: string) => values[key] ?? match).trim();
}

export function unknownTokens(value: string): string[] {
  const known = new Set<string>(TEMPLATE_TOKENS);
  return [...value.matchAll(TOKEN)].map((m) => m[1]).filter((k) => !known.has(k));
}
