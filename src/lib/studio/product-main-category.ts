import type { StorefrontContext } from "@/lib/catalogue/storefront";
import { pickMainCategory, type OrderedCategory } from "@/lib/catalogue/main-category";
import { prisma } from "@/lib/prisma";
import type { StudioCommerceCategory } from "./commerce-pages";

/** The product's main category (chosen primary, else first live category in site order). */
export async function productMainCategory(
  ctx: NonNullable<StorefrontContext>,
  productId: string,
): Promise<StudioCommerceCategory | undefined> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { primaryCategoryId: true, categoryLinks: { select: { categoryId: true } } },
  });
  if (!product) return undefined;
  const linked = new Set(product.categoryLinks.map((l) => l.categoryId));
  const cat = pickMainCategory(product.primaryCategoryId, linked, ctx.categories);
  return cat ? { id: cat.id, slug: cat.slug, title: cat.title } : undefined;
}

/** Adds each product's main category slug, for product links. */
export async function withMainCategorySlugs<P extends { id: string; primaryCategoryId: string | null }>(
  products: P[],
  ordered: readonly OrderedCategory[],
): Promise<(P & { mainCategorySlug: string | null })[]> {
  if (products.length === 0) return [];
  const links = await prisma.productCategory.findMany({
    where: { productId: { in: products.map((p) => p.id) } },
    select: { productId: true, categoryId: true },
  });
  const byProduct = new Map<string, Set<string>>();
  for (const l of links) {
    const set = byProduct.get(l.productId) ?? new Set<string>();
    set.add(l.categoryId);
    byProduct.set(l.productId, set);
  }
  return products.map((p) => ({
    ...p,
    mainCategorySlug:
      pickMainCategory(p.primaryCategoryId, byProduct.get(p.id) ?? new Set(), ordered)?.slug ?? null,
  }));
}
