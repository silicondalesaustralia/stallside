import { prisma } from "@/lib/prisma";
import type { CollectionPageRef } from "./group-collection-pages";

export async function loadStandPreOrderPages(
  ownerId: string,
  standId: string,
): Promise<CollectionPageRef[]> {
  const pages = await prisma.preOrderPage.findMany({
    where: { ownerId, standId },
    orderBy: [{ collectionAt: "asc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      collectionAt: true,
      orderByAt: true,
      preOrderUpsellProductId: true,
      items: { select: { productId: true } },
    },
  });
  return pages.map((page) => ({
    id: page.id,
    title: page.title,
    collectionAt: page.collectionAt,
    orderByAt: page.orderByAt,
    productIds: page.items.map((item) => item.productId),
    upsellProductId: page.preOrderUpsellProductId,
  }));
}
