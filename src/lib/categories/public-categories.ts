import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { businessPageProductWhere } from "@/lib/product-visibility";
import { standCatalogTag } from "@/lib/stand-catalog-tag";

export type ShopCategory = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  /** Visible products on this stand, in category order. */
  productIds: string[];
};

async function fetchShopCategories(standSlug: string): Promise<ShopCategory[]> {
  const stand = await prisma.stand.findUnique({
    where: { slug: standSlug },
    select: { id: true, ownerId: true },
  });
  if (!stand) return [];
  const productWhere = { standId: stand.id, ...businessPageProductWhere };
  const rows = await prisma.category.findMany({
    where: {
      ownerId: stand.ownerId,
      isActive: true,
      showOnWebsite: true,
      products: { some: { product: productWhere } },
    },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      imageUrl: true,
      products: {
        where: { product: productWhere },
        orderBy: [{ sortOrder: "asc" }, { product: { sortOrder: "asc" } }],
        select: { productId: true, product: { select: { imageUrl: true } } },
      },
    },
  });
  return rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    imageUrl: c.imageUrl ?? c.products.find((l) => l.product.imageUrl)?.product.imageUrl ?? null,
    productIds: c.products.map((l) => l.productId),
  }));
}

/** Active, shop-visible categories with at least one visible product (cached 30s). */
export function loadStandShopCategories(standSlug: string): Promise<ShopCategory[]> {
  const slug = standSlug.trim().toLowerCase();
  return unstable_cache(() => fetchShopCategories(slug), ["stand-shop-categories", slug], {
    revalidate: 30,
    tags: [standCatalogTag(slug)],
  })();
}
