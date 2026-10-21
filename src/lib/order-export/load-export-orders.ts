import { prisma } from "@/lib/prisma";
import { COUNTED_STATUSES } from "@/lib/order-metrics";

/** Hard cap so one request cannot stream an unbounded table. */
export const EXPORT_ORDER_LIMIT = 20_000;

export async function loadExportOrders(input: {
  ownerId: string;
  standId: string;
  start: Date;
  end: Date;
  includeAllStatuses: boolean;
}) {
  return prisma.order.findMany({
    where: {
      ownerId: input.ownerId,
      standId: input.standId,
      createdAt: { gte: input.start, lte: input.end },
      ...(input.includeAllStatuses
        ? {}
        : { paymentStatus: { in: COUNTED_STATUSES } }),
    },
    orderBy: { createdAt: "asc" },
    take: EXPORT_ORDER_LIMIT,
    include: {
      stand: { select: { name: true } },
      items: {
        orderBy: { createdAt: "asc" },
        include: { product: { select: { sku: true } } },
      },
    },
  });
}

export type ExportOrder = Awaited<ReturnType<typeof loadExportOrders>>[number];
