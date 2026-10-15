export type OrderedCategory = { id: string; slug: string; showOnWebsite?: boolean };

/**
 * The product's main category from `ordered` (live categories in site order): the chosen
 * primary when it is still linked and live, else the first linked category shown on the
 * website, else the first linked one.
 */
export function pickMainCategory<C extends OrderedCategory>(
  primaryCategoryId: string | null | undefined,
  linkedIds: ReadonlySet<string>,
  ordered: readonly C[],
): C | undefined {
  if (primaryCategoryId && linkedIds.has(primaryCategoryId)) {
    const chosen = ordered.find((c) => c.id === primaryCategoryId);
    if (chosen) return chosen;
  }
  return (
    ordered.find((c) => linkedIds.has(c.id) && c.showOnWebsite !== false) ??
    ordered.find((c) => linkedIds.has(c.id))
  );
}

/** Main category slug per product id, from storefront products that already carry it. */
export function categorySlugsById(
  products: readonly { id: string; mainCategorySlug?: string | null }[],
): Map<string, string | null> {
  return new Map(products.map((p) => [p.id, p.mainCategorySlug ?? null]));
}

/** `/{category}/{product}`, or `/products/{product}` when the product has no category. */
export function productRelativePath(productSlug: string, categorySlug?: string | null): string {
  const product = encodeURIComponent(productSlug);
  return categorySlug ? `/${encodeURIComponent(categorySlug)}/${product}` : `/products/${product}`;
}
