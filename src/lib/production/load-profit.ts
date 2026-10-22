import { prisma } from "@/lib/prisma";
import { COUNTED_STATUSES } from "@/lib/order-metrics";

export type ProfitProductRow = {
  productId: string;
  name: string;
  units: number;
  revenueCents: number;
  costCents: number;
  /** Units sold with no known cost (product cost blank). */
  unknownCostUnits: number;
};

export type ProfitSummary = {
  orders: number;
  salesCents: number;
  gstCents: number;
  feesCents: number;
  cogsCents: number;
  grossProfitCents: number;
  suppliesPurchasedCents: number;
  batchesMade: number;
  productionCostCents: number;
  products: ProfitProductRow[];
};

/**
 * Sales minus GST, cost of goods (supplier unit price at sale, else the product's current unit cost)
 * and platform + card fees, for one business over a window.
 */
export async function loadProfit(input: {
  ownerId: string;
  standId: string;
  start: Date;
  end: Date;
}): Promise<ProfitSummary> {
  const { ownerId, standId, start, end } = input;
  const [orders, purchases, batches] = await Promise.all([
    prisma.order.findMany({
      where: { ownerId, standId, createdAt: { gte: start, lte: end }, paymentStatus: { in: COUNTED_STATUSES } },
      select: {
        totalCents: true,
        gstCents: true,
        platformFeeCents: true,
        processorFeeCents: true,
        items: {
          select: {
            productId: true,
            productNameSnapshot: true,
            quantity: true,
            lineTotalCents: true,
            supplierUnitCents: true,
            product: { select: { costCents: true } },
          },
        },
      },
    }),
    prisma.ingredientPurchase.aggregate({
      where: { ingredient: { ownerId }, receivedAt: { gte: start, lte: end } },
      _sum: { totalCents: true },
    }),
    prisma.productionBatch.aggregate({
      where: { ownerId, standId, madeAt: { gte: start, lte: end } },
      _sum: { totalCostCents: true },
      _count: true,
    }),
  ]);

  const byProduct = new Map<string, ProfitProductRow>();
  let salesCents = 0;
  let gstCents = 0;
  let feesCents = 0;
  for (const order of orders) {
    salesCents += order.totalCents;
    gstCents += order.gstCents;
    feesCents += order.platformFeeCents + (order.processorFeeCents ?? 0);
    for (const item of order.items) {
      const row = byProduct.get(item.productId) ?? {
        productId: item.productId,
        name: item.productNameSnapshot,
        units: 0,
        revenueCents: 0,
        costCents: 0,
        unknownCostUnits: 0,
      };
      const unitCost = item.supplierUnitCents ?? item.product.costCents;
      row.units += item.quantity;
      row.revenueCents += item.lineTotalCents;
      if (unitCost == null) row.unknownCostUnits += item.quantity;
      else row.costCents += unitCost * item.quantity;
      byProduct.set(item.productId, row);
    }
  }
  const products = [...byProduct.values()].sort((a, b) => b.revenueCents - a.revenueCents);
  const cogsCents = products.reduce((sum, p) => sum + p.costCents, 0);

  return {
    orders: orders.length,
    salesCents,
    gstCents,
    feesCents,
    cogsCents,
    grossProfitCents: salesCents - gstCents - cogsCents - feesCents,
    suppliesPurchasedCents: purchases._sum.totalCents ?? 0,
    batchesMade: batches._count,
    productionCostCents: batches._sum.totalCostCents ?? 0,
    products,
  };
}
