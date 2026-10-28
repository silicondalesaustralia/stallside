import type { DraftOption, DraftVariant } from "./variant-draft";
import {
  optionNamesOf,
  type VariantOptionNames,
  type VariantOptionValues,
} from "./variant-title";

/** Saved option names plus the distinct values used by the product's variants. */
export function variantDraftOptions(
  product: VariantOptionNames & { variants: VariantOptionValues[] },
): DraftOption[] {
  const keys = ["option1", "option2", "option3"] as const;
  return optionNamesOf(product).map((name, i) => ({
    name,
    values: [
      ...new Set(product.variants.map((v) => v[keys[i]]?.trim() ?? "").filter(Boolean)),
    ].join(", "),
  }));
}

export function variantDraftRows(
  variants: (VariantOptionValues & {
    priceCents: number;
    sku: string | null;
    stockQuantity: number;
  })[],
): DraftVariant[] {
  return variants.map((v) => ({
    values: [v.option1, v.option2, v.option3].filter((x): x is string => Boolean(x)),
    price: (v.priceCents / 100).toFixed(2),
    sku: v.sku ?? "",
    stock: String(v.stockQuantity),
  }));
}
