import { prisma } from "@/lib/prisma";
import { PaymentMethod, PaymentStatus } from "@/generated/prisma/client";
import { syncOrderProcessorFees } from "./sync-order-fees";

const ONLINE_METHODS = [
  PaymentMethod.CARD,
  PaymentMethod.SQUARE,
  PaymentMethod.PAYPAL,
];

/** Fill processor fees on paid online orders that do not have them yet. */
export async function syncPendingProcessorFees(input: {
  since?: Date;
  limit?: number;
}) {
  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: { in: ONLINE_METHODS },
      processorFeesSyncedAt: null,
      ...(input.since ? { createdAt: { gte: input.since } } : {}),
    },
    orderBy: { createdAt: "asc" },
    take: input.limit ?? 100,
    select: { id: true },
  });

  const counts = { checked: orders.length, synced: 0, pending: 0, failed: 0 };
  for (const { id } of orders) {
    try {
      const result = await syncOrderProcessorFees(id);
      if (result === "synced") counts.synced += 1;
      if (result === "pending") counts.pending += 1;
    } catch (error) {
      counts.failed += 1;
      console.error("Processor fee sync failed", id, error);
    }
  }
  return counts;
}
