import { prisma } from "@/lib/prisma";
import { COUNTED_STATUSES } from "@/lib/order-metrics";

export const ORDERS_LIST_LIMIT = 100;

const metricSelect = {
  totalCents: true,
  currency: true,
  createdAt: true,
  items: { select: { quantity: true } },
} as const;

/** Stats (this range vs previous), refunds and the newest orders for the Orders page. */
export async function loadOrdersPage(input: {
  ownerId: string;
  standId: string;
  window: { start: Date; end: Date; prevStart: Date; prevEnd: Date };
}) {
  const scope = { ownerId: input.ownerId, standId: input.standId };
  const inWindow = { createdAt: { gte: input.window.start, lte: input.window.end } };
  const counted = { paymentStatus: { in: COUNTED_STATUSES } };

  const [current, previous, refunded, orders] = await Promise.all([
    prisma.order.findMany({
      where: { ...scope, ...inWindow, ...counted },
      select: metricSelect,
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      where: {
        ...scope,
        ...counted,
        createdAt: { gte: input.window.prevStart, lte: input.window.prevEnd },
      },
      select: metricSelect,
    }),
    prisma.order.findMany({
      where: {
        ...scope,
        ...inWindow,
        OR: [{ refundedCents: { gt: 0 } }, { paymentStatus: "REFUNDED" }],
      },
      select: { totalCents: true, refundedCents: true },
    }),
    prisma.order.findMany({
      where: { ...scope, ...inWindow },
      orderBy: { createdAt: "desc" },
      take: ORDERS_LIST_LIMIT,
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        customerName: true,
        receiptEmail: true,
        totalCents: true,
        currency: true,
        paymentStatus: true,
        refundedCents: true,
        shopperSubscriptionId: true,
        isPreOrder: true,
        saleOrigin: true,
        handoverMode: true,
        collectionStatus: true,
        shippedAt: true,
        deliveredAt: true,
        trackingNumber: true,
        fulfilment: { select: { fulfilmentStatus: true } },
        items: { select: { quantity: true } },
      },
    }),
  ]);

  return {
    current,
    previous,
    orders,
    currency: current[0]?.currency ?? orders[0]?.currency ?? "AUD",
    refundedCents: refunded.reduce((sum, o) => sum + (o.refundedCents ?? o.totalCents), 0),
  };
}
