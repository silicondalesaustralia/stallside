import { prisma } from "@/lib/prisma";

/** Categories in shop-menu order. */
export function listOwnerCategories(ownerId: string) {
  return prisma.category.findMany({
    where: { ownerId },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      isActive: true,
      showOnWebsite: true,
      _count: { select: { products: true } },
    },
  });
}
export type OwnerCategoryRow = Awaited<ReturnType<typeof listOwnerCategories>>[number];

/** One category with its products in order, plus every product that could be added. */
export async function getOwnerCategoryDetail(ownerId: string, categoryId: string) {
  const [category, products] = await Promise.all([
    prisma.category.findFirst({
      where: { id: categoryId, ownerId },
      select: {
        id: true,
        title: true,
        slug: true,
        isActive: true,
        showOnWebsite: true,
        products: {
          where: { product: { isArchived: false } },
          orderBy: [{ sortOrder: "asc" }, { product: { name: "asc" } }],
          select: {
            productId: true,
            product: { select: { name: true, isHidden: true, imageUrl: true, stand: { select: { name: true } } } },
          },
        },
      },
    }),
    prisma.product.findMany({
      where: { ownerId, isArchived: false },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, sku: true, stand: { select: { name: true } } },
    }),
  ]);
  return category ? { category, products } : null;
}
export type OwnerCategoryDetail = NonNullable<Awaited<ReturnType<typeof getOwnerCategoryDetail>>>;
