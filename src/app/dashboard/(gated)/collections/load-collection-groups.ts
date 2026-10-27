import { prisma } from "@/lib/prisma";
import { loadCollectionOrders, toCollectionOrderView } from "@/lib/collections/load-collections";
import type { PrintBrand } from "./CollectionPrintBrand";
import { groupCollectionPages, type CollectionPageGroup } from "./group-collection-pages";
import { loadStandPreOrderPages } from "./load-preorder-pages";
import { loadStandSubscriptionOffers } from "./load-subscription-offers";

/** Paid pre-order and subscription orders for a business, grouped by pre-order page / cycle. */
export async function loadCollectionGroups(
  ownerId: string,
  stand: { id: string; name: string },
): Promise<{ groups: CollectionPageGroup[]; brand: PrintBrand }> {
  const [rawOrders, pages, offers, standBrand] = await Promise.all([
    loadCollectionOrders(ownerId, stand.id),
    loadStandPreOrderPages(ownerId, stand.id),
    loadStandSubscriptionOffers(ownerId, stand.id),
    prisma.stand.findFirst({
      where: { id: stand.id, ownerId },
      select: { name: true, logoUrl: true },
    }),
  ]);
  return {
    groups: groupCollectionPages(rawOrders.map(toCollectionOrderView), pages, offers),
    brand: { name: standBrand?.name ?? stand.name, logoUrl: standBrand?.logoUrl ?? null },
  };
}

export function collectedCount(group: CollectionPageGroup): number {
  return group.orders.filter((order) => order.collectionStatus === "COLLECTED").length;
}
