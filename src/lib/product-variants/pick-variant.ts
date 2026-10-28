import type { PublicVariant } from "./public-variant";

/** True when the variant agrees with every picked value (blank = any). */
export function variantMatches(variant: PublicVariant, picked: string[]): boolean {
  return picked.every((value, i) => !value || variant.values[i] === value);
}

/** First in-stock variant's values, else the first variant's. */
export function initialVariantPick(variants: PublicVariant[]): string[] {
  const first = variants.find((v) => v.stockQuantity > 0) ?? variants[0];
  return first ? [...first.values] : [];
}

export function findVariant(
  variants: PublicVariant[],
  picked: string[],
): PublicVariant | null {
  if (!picked.every(Boolean)) return null;
  return variants.find((v) => variantMatches(v, picked)) ?? null;
}
