import { Prisma, ShopperSubStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { COUNTED_STATUSES } from "@/lib/order-metrics";
import { productDashboardWhere } from "@/lib/product-visibility";
import type { DateWindow } from "@/lib/date-range";

type LowStockRow = {
  id: string;
  name: string;
  stockQuantity: number;
};

export async function loadDashboardHomeData(args: {
  ownerId: string;
  standId: string;
  window: DateWindow;
  monthStart: Date;
  loadUpgradeSignals: boolean;
}) {
  const { ownerId, standId, window, monthStart, loadUpgradeSignals } = args;
  const standScope = { ownerId, standId };
  const productScope = { ...standScope, ...productDashboardWhere };
  const metricSelect = {
    totalCents: true,
    paymentMethod: true,
    currency: true,
    createdAt: true,
  } as const;

  const [
    products,
    currentOrders,
    previousOrders,
    lowStockRows,
    hasPreOrderProduct,
    soldOutTakeNow,
    recent,
    cardInterests,
    restockSubscriberCount,
    preOrderPageCount,
    subscriptionOfferCount,
    activeShopperSubs,
  ] = await Promise.all([
    prisma.product.count({ where: productScope }),
    prisma.order.findMany({
      where: {
        ...standScope,
        createdAt: { gte: window.start, lte: window.end },
        paymentStatus: { in: COUNTED_STATUSES },
      },
      select: metricSelect,
    }),
    prisma.order.findMany({
      where: {
        ...standScope,
        createdAt: { gte: window.prevStart, lte: window.prevEnd },
        paymentStatus: { in: COUNTED_STATUSES },
      },
      select: metricSelect,
    }),
    prisma.$queryRaw<LowStockRow[]>(Prisma.sql`
      SELECT id, name, "stockQuantity"
      FROM "Product"
      WHERE "ownerId" = ${ownerId}
        AND "standId" = ${standId}
        AND "isArchived" = false
        AND "stockQuantity" <= "lowStockThreshold"
      ORDER BY "stockQuantity" ASC
      LIMIT 8
    `),
    prisma.product.findFirst({
      where: { ...productScope, isPreOrder: true },
      select: { id: true },
    }),
    prisma.product.count({
      where: {
        ...productScope,
        isPreOrder: false,
        stockQuantity: { lte: 0 },
      },
    }),
    prisma.order.findMany({
      where: standScope,
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        orderNumber: true,
        totalCents: true,
        currency: true,
        paymentMethod: true,
      },
    }),
    loadUpgradeSignals
      ? prisma.cardInterest.findMany({
          where: { standId, createdAt: { gte: monthStart } },
          select: { subtotalCents: true, currency: true },
        })
      : Promise.resolve([]),
    loadUpgradeSignals
      ? prisma.restockSubscriber.count({
          where: { standId, unsubscribedAt: null },
        })
      : Promise.resolve(0),
    prisma.preOrderPage.count({ where: { ownerId, standId } }),
    prisma.subscriptionOffer.count({ where: { ownerId, standId } }),
    prisma.shopperSubscription.count({
      where: { ownerId, standId, status: ShopperSubStatus.ACTIVE },
    }),
  ]);

  return {
    products,
    currentOrders,
    previousOrders,
    lowStockRows,
    hasPreOrderProduct: Boolean(hasPreOrderProduct),
    soldOutTakeNow,
    recent,
    cardInterests,
    restockSubscriberCount,
    preOrderPageCount,
    subscriptionOfferCount,
    activeShopperSubs,
  };
}
