import { prisma } from "@/lib/prisma";

/** Variant count per product id; products without variants are left out. */
export async function variantCountsFor(productIds: string[]): Promise<Map<string, number>> {
  if (productIds.length === 0) return new Map();
  const rows = await prisma.productVariant.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds } },
    _count: { _all: true },
  });
  return new Map(rows.map((row) => [row.productId, row._count._all]));
}
