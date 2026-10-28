export const MAX_VARIANT_OPTIONS = 3;
export const MAX_VARIANTS_PER_PRODUCT = 100;

export type VariantOptionNames = {
  option1Name: string | null;
  option2Name: string | null;
  option3Name: string | null;
};

export type VariantOptionValues = {
  option1: string | null;
  option2: string | null;
  option3: string | null;
};

export function optionNamesOf(product: VariantOptionNames): string[] {
  return [product.option1Name, product.option2Name, product.option3Name]
    .map((n) => n?.trim() ?? "")
    .filter(Boolean);
}

export function optionValuesOf(variant: VariantOptionValues): string[] {
  return [variant.option1, variant.option2, variant.option3]
    .map((v) => v?.trim() ?? "")
    .filter(Boolean);
}

/** Short label for pickers and lists, e.g. "Large / Red". */
export function variantLabel(variant: VariantOptionValues): string {
  return optionValuesOf(variant).join(" / ") || "Default";
}

/** Order-line snapshot, e.g. "Size: Large · Colour: Red". */
export function variantSnapshot(
  product: VariantOptionNames,
  variant: VariantOptionValues,
): string | null {
  const names = optionNamesOf(product);
  const values = [variant.option1, variant.option2, variant.option3];
  const parts = names
    .map((name, i) => {
      const value = values[i]?.trim();
      return value ? `${name}: ${value}` : null;
    })
    .filter((p): p is string => Boolean(p));
  return parts.length ? parts.join(" · ") : null;
}

/** Joins a variant snapshot with add-on option text for one order line. */
export function joinSnapshots(
  variantPart: string | null,
  optionsPart: string | null,
): string | null {
  const parts = [variantPart, optionsPart].filter((p): p is string => Boolean(p));
  return parts.length ? parts.join(" · ") : null;
}
