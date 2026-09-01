import { PaymentStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveOrderCollectionAt } from "@/lib/fulfilment/legacy-read";
import type { CollectionOrderView } from "./group-collections";

export { groupCollectionDays, dayMakeListMeta } from "./group-collections";

const COLLECTION_PAYMENT_STATUSES: PaymentStatus[] = [
  PaymentStatus.PAID,
  PaymentStatus.DEPOSIT_PAID,
  PaymentStatus.BALANCE_DUE,
  PaymentStatus.BALANCE_FAILED,
];

/** Upcoming forever + last 14 days (avoids full pre-order history). */
export async function loadCollectionOrders(ownerId: string, standId: string) {
  const collectionFrom = new Date();
  collectionFrom.setHours(0, 0, 0, 0);
  collectionFrom.setDate(collectionFrom.getDate() - 14);

  return prisma.order.findMany({
    where: {
      ownerId,
      standId,
      isPreOrder: true,
      paymentStatus: { in: COLLECTION_PAYMENT_STATUSES },
      collectionAt: { gte: collectionFrom },
    },
    orderBy: [{ collectionAt: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      customerPhone: true,
      receiptEmail: true,
      collectionAt: true,
      collectionNote: true,
      collectionStatus: true,
      paymentStatus: true,
      paymentTiming: true,
      handoverMode: true,
      deliveryAddressLine1: true,
      deliverySuburb: true,
      deliveryPostcode: true,
      balanceCents: true,
      depositCents: true,
      totalCents: true,
      currency: true,
      createdAt: true,
      stand: { select: { name: true } },
      fulfilment: {
        select: {
          optionLabel: true,
          pickupLocationName: true,
          pickupPublicLabel: true,
          windowLabel: true,
          collectionStartsAt: true,
        },
      },
      shopperSubscription: {
        select: {
          offerId: true,
          offer: { select: { title: true } },
        },
      },
      items: {
        select: {
          id: true,
          productId: true,
          quantity: true,
          productNameSnapshot: true,
          optionsSnapshot: true,
        },
      },
    },
  });
}

export type CollectionOrder = Awaited<
  ReturnType<typeof loadCollectionOrders>
>[number];

/** Flatten Prisma join into the Collections view shape. */
export function toCollectionOrderView(
  order: CollectionOrder,
): CollectionOrderView {
  const collectionAt =
    resolveOrderCollectionAt(order, order.fulfilment) ?? order.collectionAt;
  const fulfilmentLabel =
    order.fulfilment?.windowLabel && order.fulfilment.pickupPublicLabel
      ? `${order.fulfilment.windowLabel} · ${order.fulfilment.pickupPublicLabel}`
      : order.fulfilment?.optionLabel ?? null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    receiptEmail: order.receiptEmail,
    collectionAt,
    collectionNote: order.collectionNote,
    collectionStatus: order.collectionStatus,
    paymentStatus: order.paymentStatus,
    paymentTiming: order.paymentTiming,
    handoverMode: order.handoverMode,
    deliveryAddressLine1: order.deliveryAddressLine1,
    deliverySuburb: order.deliverySuburb,
    deliveryPostcode: order.deliveryPostcode,
    balanceCents: order.balanceCents,
    depositCents: order.depositCents,
    totalCents: order.totalCents,
    currency: order.currency,
    stand: order.stand,
    subscriptionOfferId: order.shopperSubscription?.offerId ?? null,
    subscriptionOfferTitle: order.shopperSubscription?.offer.title ?? null,
    fulfilmentLabel,
    items: order.items,
  };
}
