import type { StorefrontContext } from "@/lib/catalogue/storefront";
import { prisma } from "@/lib/prisma";
import type { StudioCommerceCategory } from "./commerce-pages";

/** The product's main category: the first live category it belongs to, in the site's category order. */
export async function productMainCategory(
  ctx: NonNullable<StorefrontContext>,
  productId: string,
): Promise<StudioCommerceCategory | undefined> {
  const links = await prisma.productCategory.findMany({
    where: { productId },
    select: { categoryId: true },
  });
  const linked = new Set(links.map((l) => l.categoryId));
  const cat =
    ctx.categories.find((c) => linked.has(c.id) && c.showOnWebsite) ??
    ctx.categories.find((c) => linked.has(c.id));
  return cat ? { id: cat.id, slug: cat.slug, title: cat.title } : undefined;
}
