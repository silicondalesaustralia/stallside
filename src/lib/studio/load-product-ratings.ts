import { prisma } from "@/lib/prisma";
import type { CategoryRating as ProductRating } from "./category-ratings";

/** Approved review average (one decimal) and count per product. Empty on failure so the page still renders. */
export async function loadProductRatings(ownerId: string, productIds: string[]): Promise<Map<string, ProductRating>> {
  if (productIds.length === 0) return new Map();
  try {
    const stats = await prisma.review.groupBy({
      by: ["productId"],
      where: { ownerId, status: "APPROVED", rating: { gte: 1 }, productId: { in: productIds } },
      _avg: { rating: true },
      _count: { _all: true },
    });
    const out = new Map<string, ProductRating>();
    for (const s of stats) {
      if (!s.productId || !s._avg.rating || s._count._all === 0) continue;
      out.set(s.productId, { average: Math.round(s._avg.rating * 10) / 10, count: s._count._all });
    }
    return out;
  } catch (err) {
    console.error("[studio metadata] product ratings", err);
    return new Map();
  }
}
