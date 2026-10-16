import { prisma } from "@/lib/prisma";
import type { UpsellRule } from "./rules";

export type UpsellChannel = "website" | "stall";

/** Active upsells for a business, newest first, with category picks expanded to their products. */
export async function loadUpsellRules(standId: string, channel?: UpsellChannel): Promise<UpsellRule[]> {
  const rows = await prisma.upsell.findMany({
    where: {
      standId,
      isActive: true,
      ...(channel === "website" ? { showOnWebsite: true } : {}),
      ...(channel === "stall" ? { showAtStall: true } : {}),
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true, offerProductId: true, priceCents: true, sitewide: true, categoryIds: true, productIds: true },
  });
  if (rows.length === 0) return [];

  const categoryIds = [...new Set(rows.flatMap((r) => r.categoryIds))];
  const links = categoryIds.length
    ? await prisma.productCategory.findMany({
        where: { categoryId: { in: categoryIds } },
        select: { categoryId: true, productId: true },
      })
    : [];
  const productsByCategory = new Map<string, string[]>();
  for (const link of links) {
    productsByCategory.set(link.categoryId, [...(productsByCategory.get(link.categoryId) ?? []), link.productId]);
  }

  return rows.map((r) => ({
    id: r.id,
    offerProductId: r.offerProductId,
    priceCents: r.priceCents,
    sitewide: r.sitewide,
    productIds: r.productIds,
    categoryProductIds: [...new Set(r.categoryIds.flatMap((c) => productsByCategory.get(c) ?? []))],
  }));
}
