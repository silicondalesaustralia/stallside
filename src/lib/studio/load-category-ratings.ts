import { prisma } from "@/lib/prisma";
import { categoryRatings, type CategoryRating } from "./category-ratings";

/** Approved review totals for each category's products. Empty on failure so the page still renders. */
export async function loadCategoryRatings(
  ownerId: string,
  categoryIds: string[],
): Promise<Map<string, CategoryRating>> {
  if (categoryIds.length === 0) return new Map();
  try {
    const links = await prisma.productCategory.findMany({
      where: { categoryId: { in: categoryIds } },
      select: { productId: true, categoryId: true },
    });
    if (links.length === 0) return new Map();
    const stats = await prisma.review.groupBy({
      by: ["productId"],
      where: {
        ownerId,
        status: "APPROVED",
        rating: { gte: 1 },
        productId: { in: [...new Set(links.map((l) => l.productId))] },
      },
      _sum: { rating: true },
      _count: { _all: true },
    });
    return categoryRatings(
      links,
      stats.map((s) => ({ productId: s.productId, ratingSum: s._sum.rating ?? 0, count: s._count._all })),
    );
  } catch (err) {
    console.error("[studio metadata] category ratings", err);
    return new Map();
  }
}
