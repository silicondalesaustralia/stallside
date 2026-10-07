import { prisma } from "@/lib/prisma";

export type ProductStockSplit = {
  ownerUnits: number;
  supplierUnits: number;
};

/** Split on-hand stock into owner residual vs ACTIVE supplier lots. */
export async function loadProductStockSplits(
  products: { id: string; stockQuantity: number }[],
): Promise<Map<string, ProductStockSplit>> {
  const ids = products.map((p) => p.id);
  const out = new Map<string, ProductStockSplit>();
  for (const product of products) {
    out.set(product.id, {
      ownerUnits: product.stockQuantity,
      supplierUnits: 0,
    });
  }
  if (ids.length === 0) return out;

  const lots = await prisma.stockLot.groupBy({
    by: ["productId"],
    where: {
      productId: { in: ids },
      status: "ACTIVE",
      memberId: { not: null },
      quantityRemaining: { gt: 0 },
    },
    _sum: { quantityRemaining: true },
  });

  for (const row of lots) {
    const product = products.find((p) => p.id === row.productId);
    if (!product) continue;
    const supplierUnits = Math.min(
      row._sum.quantityRemaining ?? 0,
      product.stockQuantity,
    );
    out.set(row.productId, {
      supplierUnits,
      ownerUnits: Math.max(0, product.stockQuantity - supplierUnits),
    });
  }
  return out;
}
