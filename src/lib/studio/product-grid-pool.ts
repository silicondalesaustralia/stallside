import type { StudioMetadata } from "@/lib/studio/types";

export type ProductGridSource = "all" | "category" | "manual" | "activeCategory";

type PoolInput = {
  source: ProductGridSource;
  categoryId: string;
  productIds: string[];
  limit: number;
  meta: StudioMetadata;
};

export function isCategoryPage(meta: StudioMetadata): boolean {
  return meta.commerceContext?.kind === "category";
}

/** On a category page the grid only ever shows that category's products: all of them, or the chosen ones. */
export function categoryPageSource(source: ProductGridSource): "activeCategory" | "manual" {
  return source === "manual" ? "manual" : "activeCategory";
}

function pick(ids: string[], products: StudioMetadata["products"]) {
  return ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
}

export function productGridPool({ source, categoryId, productIds, limit, meta }: PoolInput) {
  if (isCategoryPage(meta)) {
    const catId = meta.commerceContext?.category?.id;
    if (!catId) return [];
    const inCategory = meta.products.filter((p) => p.categoryIds.includes(catId));
    if (categoryPageSource(source) === "manual") {
      return pick(productIds, inCategory);
    }
    return inCategory;
  }

  let pool = meta.products;
  if (source === "manual" && productIds.length > 0) {
    pool = pick(productIds, meta.products);
  } else if (source === "activeCategory") {
    const catId = meta.commerceContext?.category?.id ?? categoryId;
    pool = catId ? meta.products.filter((p) => p.categoryIds.includes(catId)) : meta.products;
  } else if (source === "category" && categoryId) {
    pool = meta.products.filter((p) => p.categoryIds.includes(categoryId));
  }
  if (isBrowsePage(meta)) return pool;
  return pool.slice(0, Math.max(1, Math.min(limit, 12)));
}

/** Shop and category pages list every matching product, with sorting and filters. */
export function isBrowsePage(meta: StudioMetadata): boolean {
  const kind = meta.commerceContext?.kind;
  return kind === "shop" || kind === "category";
}
