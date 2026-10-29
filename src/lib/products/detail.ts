import { prisma } from "@/lib/prisma";

/** One owner product with what the app's product screen shows. */
export function getOwnerProductDetail(ownerId: string, productId: string) {
  return prisma.product.findFirst({
    where: { id: productId, ownerId },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      galleryImageUrls: true,
      priceCents: true,
      compareAtPriceCents: true,
      costCents: true,
      currency: true,
      stockQuantity: true,
      lowStockThreshold: true,
      sku: true,
      upc: true,
      isHidden: true,
      isArchived: true,
      preOrderEligible: true,
      priceTiers: true,
      stand: { select: { name: true } },
      member: { select: { name: true } },
      _count: { select: { optionGroups: true } },
      variants: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          option1: true,
          option2: true,
          option3: true,
          sku: true,
          priceCents: true,
          stockQuantity: true,
          isActive: true,
        },
      },
    },
  });
}

export type OwnerProductDetail = NonNullable<Awaited<ReturnType<typeof getOwnerProductDetail>>>;
