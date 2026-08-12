import {
  HandoverMode,
  PaymentStatus,
  PaymentTiming,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { formatCollectionLabel } from "@/lib/pre-order";

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

export function groupCollectionDays(orders: CollectionOrder[]) {
  const groups = new Map<
    string,
    {
      key: string;
      label: string;
      orders: CollectionOrder[];
      itemCount: number;
      takenCents: number;
      currency: string;
      windowClosed: boolean;
    }
  >();

  for (const order of orders) {
    const at = order.collectionAt;
    if (!at) continue;
    const key = at.toISOString().slice(0, 10);
    const existing = groups.get(key);
    const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
    const taken =
      order.paymentTiming === PaymentTiming.DEPOSIT_THEN_BALANCE &&
      order.paymentStatus !== PaymentStatus.PAID
        ? (order.depositCents ?? 0)
        : order.totalCents;
    if (existing) {
      existing.orders.push(order);
      existing.itemCount += itemCount;
      existing.takenCents += taken;
    } else {
      groups.set(key, {
        key,
        label: formatCollectionLabel(at),
        orders: [order],
        itemCount,
        takenCents: taken,
        currency: order.currency,
        windowClosed: at.getTime() <= Date.now(),
      });
    }
  }

  return [...groups.values()];
}

export function dayMakeListMeta(orders: CollectionOrder[]) {
  const skuMap = new Map<string, number>();
  const suburbMap = new Map<string, number>();
  for (const order of orders) {
    for (const item of order.items) {
      const name = item.optionsSnapshot
        ? `${item.productNameSnapshot} (${item.optionsSnapshot})`
        : item.productNameSnapshot;
      skuMap.set(name, (skuMap.get(name) ?? 0) + item.quantity);
    }
    if (order.handoverMode === HandoverMode.DELIVER) {
      const suburb = order.deliverySuburb?.trim() || "Unknown";
      suburbMap.set(suburb, (suburbMap.get(suburb) ?? 0) + 1);
    }
  }
  return {
    skus: [...skuMap.entries()]
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    suburbs: [...suburbMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}
