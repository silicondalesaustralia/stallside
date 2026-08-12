import { PaymentStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

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
