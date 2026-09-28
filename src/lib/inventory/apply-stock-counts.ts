import { prisma } from "@/lib/prisma";
import { InventorySource } from "@/generated/prisma/client";
import { notifyLowStockForProducts } from "@/lib/notify";

/** Sets each product to its counted quantity and logs a reconciliation adjustment. Returns products changed. */
export async function applyStockCounts(input: {
  ownerId: string;
  counts: Map<string, number>;
  reason: string;
  standId?: string;
}): Promise<number> {
  const { ownerId, counts, reason } = input;
  const products = await prisma.product.findMany({
    where: {
      ownerId,
      id: { in: [...counts.keys()] },
      ...(input.standId ? { standId: input.standId } : {}),
    },
    select: { id: true, standId: true, stockQuantity: true, lowStockThreshold: true },
  });
  const changed = products.filter((p) => counts.get(p.id) !== p.stockQuantity);

  await prisma.$transaction(
    changed.flatMap((p) => {
      const next = counts.get(p.id) ?? p.stockQuantity;
      return [
        prisma.product.update({ where: { id: p.id }, data: { stockQuantity: next } }),
        prisma.inventoryAdjustment.create({
          data: {
            productId: p.id,
            ownerId,
            standId: p.standId,
            changeQuantity: next - p.stockQuantity,
            previousQuantity: p.stockQuantity,
            newQuantity: next,
            reason,
            source: InventorySource.RECONCILIATION,
          },
        }),
      ];
    }),
  );

  const low = changed.filter((p) => (counts.get(p.id) ?? 0) <= p.lowStockThreshold);
  for (const p of low) {
    try {
      await notifyLowStockForProducts([p.id], ownerId, p.standId);
    } catch (error) {
      console.error("Low-stock notify after stock count failed", error);
    }
  }
  return changed.length;
}
