export type CategoryRating = { average: number; count: number };

type Link = { productId: string; categoryId: string };
type ProductStats = { productId: string | null; ratingSum: number; count: number };

/** Approved product reviews totalled per category: average to one decimal and review count. */
export function categoryRatings(links: Link[], stats: ProductStats[]): Map<string, CategoryRating> {
  const byProduct = new Map(stats.filter((s) => s.productId).map((s) => [s.productId, s]));
  const totals = new Map<string, { sum: number; count: number }>();
  for (const link of links) {
    const s = byProduct.get(link.productId);
    if (!s || s.count === 0) continue;
    const t = totals.get(link.categoryId) ?? { sum: 0, count: 0 };
    t.sum += s.ratingSum;
    t.count += s.count;
    totals.set(link.categoryId, t);
  }
  const out = new Map<string, CategoryRating>();
  for (const [id, t] of totals) {
    out.set(id, { average: Math.round((t.sum / t.count) * 10) / 10, count: t.count });
  }
  return out;
}
