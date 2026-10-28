import {
  optionNamesOf,
  variantLabel,
  type VariantOptionNames,
  type VariantOptionValues,
} from "./variant-title";

export type PublicVariant = {
  id: string;
  /** Option values in option-name order, e.g. ["Large", "Red"]. */
  values: string[];
  label: string;
  priceCents: number;
  compareAtCents: number | null;
  stockQuantity: number;
  imageUrl: string | null;
};

/** Prisma include for live variants on public product queries. */
export const publicVariantsInclude = {
  where: { isActive: true },
  orderBy: { sortOrder: "asc" as const },
};

type VariantRow = VariantOptionValues & {
  id: string;
  priceCents: number;
  compareAtCents: number | null;
  stockQuantity: number;
  imageUrl: string | null;
};

export function mapPublicVariants(
  product: Partial<VariantOptionNames> & { variants?: VariantRow[] },
  closed: boolean,
): { optionNames: string[]; variants: PublicVariant[] } {
  const rows = product.variants ?? [];
  if (rows.length === 0) return { optionNames: [], variants: [] };
  const optionNames = optionNamesOf({
    option1Name: product.option1Name ?? null,
    option2Name: product.option2Name ?? null,
    option3Name: product.option3Name ?? null,
  });
  const variants = rows.map((v) => ({
    id: v.id,
    values: [v.option1, v.option2, v.option3]
      .slice(0, optionNames.length)
      .map((x) => x?.trim() ?? ""),
    label: variantLabel(v),
    priceCents: v.priceCents,
    compareAtCents: v.compareAtCents,
    stockQuantity: closed ? 0 : v.stockQuantity,
    imageUrl: v.imageUrl,
  }));
  return { optionNames, variants };
}
