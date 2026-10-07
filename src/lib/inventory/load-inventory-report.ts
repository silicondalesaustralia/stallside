import { prisma } from "@/lib/prisma";
import { COUNTED_STATUSES } from "@/lib/order-metrics";
import { productOnStandWhere } from "@/lib/catalogue/product-on-stand";
import type { ProductSupplyStatus } from "@/generated/prisma/client";
import { stockStatusFor, type StockStatus } from "./inventory-status";

export type InventoryRow = {
  id: string;
  name: string;
  sku: string | null;
  locationName: string;
  stockQuantity: number;
  lowStockThreshold: number;
  priceCents: number;
  costCents: number | null;
  currency: string;
  supplyStatus: ProductSupplyStatus | null;
  stockStatus: StockStatus;
  incoming: number;
  sold7: number;
  sold30: number;
  /** Units per day over the last 30 days. */
  dailyRate: number;
  /** Days until stock runs out at the current rate; null when not selling. */
  daysCover: number | null;
  lastSoldAt: Date | null;
  lastCountedAt: Date | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function sumMap(rows: { productId: string; _sum: { quantity: number | null } }[]) {
  return new Map(rows.map((r) => [r.productId, r._sum.quantity ?? 0]));
}

export async function loadInventoryReport(input: {
  ownerId: string;
  standId: string | null;
  q?: string;
}): Promise<InventoryRow[]> {
  const q = input.q?.trim();
  const products = await prisma.product.findMany({
    where: {
      ownerId: input.ownerId,
      isArchived: false,
      isPreOrder: false,
      ...(input.standId ? productOnStandWhere(input.standId) : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { sku: { contains: q, mode: "insensitive" } },
              { upc: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      sku: true,
      stockQuantity: true,
      lowStockThreshold: true,
      priceCents: true,
      costCents: true,
      currency: true,
      supplyStatus: true,
      stand: { select: { name: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  const ids = products.map((p) => p.id);
  if (ids.length === 0) return [];

  const now = Date.now();
  const soldWhere = (since?: Date) => ({
    productId: { in: ids },
    order: {
      paymentStatus: { in: COUNTED_STATUSES },
      ...(since ? { createdAt: { gte: since } } : {}),
    },
  });

  const [sold7, sold30, lastSold, incoming, counted] = await Promise.all([
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: soldWhere(new Date(now - 7 * DAY_MS)),
      _sum: { quantity: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: soldWhere(new Date(now - 30 * DAY_MS)),
      _sum: { quantity: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: soldWhere(),
      _max: { createdAt: true },
    }),
    prisma.stockLot.groupBy({
      by: ["productId"],
      where: { productId: { in: ids }, status: "PENDING" },
      _sum: { quantityRemaining: true },
    }),
    prisma.inventoryAdjustment.groupBy({
      by: ["productId"],
      where: { productId: { in: ids }, source: "RECONCILIATION" },
      _max: { createdAt: true },
    }),
  ]);

  const sold7Map = sumMap(sold7);
  const sold30Map = sumMap(sold30);
  const lastSoldMap = new Map(lastSold.map((r) => [r.productId, r._max.createdAt]));
  const incomingMap = new Map(
    incoming.map((r) => [r.productId, r._sum.quantityRemaining ?? 0]),
  );
  const countedMap = new Map(counted.map((r) => [r.productId, r._max.createdAt]));

  return products.map((p) => {
    const s30 = sold30Map.get(p.id) ?? 0;
    const dailyRate = s30 / 30;
    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      locationName: p.stand.name,
      stockQuantity: p.stockQuantity,
      lowStockThreshold: p.lowStockThreshold,
      priceCents: p.priceCents,
      costCents: p.costCents,
      currency: p.currency,
      supplyStatus: p.supplyStatus,
      stockStatus: stockStatusFor(p.stockQuantity, p.lowStockThreshold),
      incoming: incomingMap.get(p.id) ?? 0,
      sold7: sold7Map.get(p.id) ?? 0,
      sold30: s30,
      dailyRate,
      daysCover: dailyRate > 0 ? Math.max(0, p.stockQuantity) / dailyRate : null,
      lastSoldAt: lastSoldMap.get(p.id) ?? null,
      lastCountedAt: countedMap.get(p.id) ?? null,
    };
  });
}

export function filterInventoryRows(rows: InventoryRow[], filter?: string) {
  if (!filter) return rows;
  if (filter === "incoming") return rows.filter((r) => r.incoming > 0);
  return rows.filter((r) => r.stockStatus === filter || r.supplyStatus === filter);
}
