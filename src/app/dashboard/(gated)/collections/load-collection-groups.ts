import { prisma } from "@/lib/prisma";
import type { CollectionPageGroup } from "@/lib/collections/group-collection-pages";
import { loadCollectionPageGroups } from "@/lib/collections/load-page-groups";
import type { PrintBrand } from "./CollectionPrintBrand";

/** Paid pre-order and subscription orders for a business, grouped by pre-order page / cycle. */
export async function loadCollectionGroups(
  ownerId: string,
  stand: { id: string; name: string },
): Promise<{ groups: CollectionPageGroup[]; brand: PrintBrand }> {
  const [groups, standBrand] = await Promise.all([
    loadCollectionPageGroups(ownerId, stand.id),
    prisma.stand.findFirst({
      where: { id: stand.id, ownerId },
      select: { name: true, logoUrl: true },
    }),
  ]);
  return {
    groups,
    brand: { name: standBrand?.name ?? stand.name, logoUrl: standBrand?.logoUrl ?? null },
  };
}

export function collectedCount(group: CollectionPageGroup): number {
  return group.orders.filter((order) => order.collectionStatus === "COLLECTED").length;
}
