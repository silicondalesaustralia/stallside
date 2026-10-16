import { prisma } from "@/lib/prisma";
import type { UpsellRow } from "./UpsellList";

function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** Dashboard summary of each upsell: what it offers, where and on which checkout. */
export async function loadUpsellRows(standId: string): Promise<UpsellRow[]> {
  const upsells = await prisma.upsell.findMany({
    where: { standId },
    orderBy: { updatedAt: "desc" },
    include: { offerProduct: { select: { name: true } } },
  });
  return upsells.map((u) => {
    const parts = [
      u.sitewide ? "sitewide" : null,
      u.categoryIds.length ? count(u.categoryIds.length, "category", "categories") : null,
      u.productIds.length ? count(u.productIds.length, "product", "products") : null,
    ].filter(Boolean);
    const channels =
      u.showOnWebsite && u.showAtStall ? "online store and stall" : u.showOnWebsite ? "online store only" : "stall only";
    return {
      id: u.id,
      name: u.name,
      offer: u.offerProduct.name,
      scope: parts.join(", "),
      channels,
      isActive: u.isActive,
    };
  });
}
