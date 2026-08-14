import {
  HandoverMode,
  PaymentStatus,
  PaymentTiming,
  type CollectionStatus,
} from "@/generated/prisma/client";
import { formatCollectionLabel } from "@/lib/pre-order";

/** Order shape used by Collections day grouping and print sheets. */
export type CollectionOrderView = {
  id: string;
  orderNumber: string;
  customerName: string | null;
  customerPhone: string | null;
  receiptEmail: string | null;
  collectionAt: Date | null;
  collectionNote: string | null;
  collectionStatus: CollectionStatus | null;
  paymentStatus: PaymentStatus;
  paymentTiming: PaymentTiming;
  handoverMode: HandoverMode;
  deliveryAddressLine1: string | null;
  deliverySuburb: string | null;
  deliveryPostcode: string | null;
  balanceCents: number | null;
  depositCents: number | null;
  totalCents: number;
  currency: string;
  stand: { name: string };
  /** Present when this order came from a shopper subscription cycle. */
  subscriptionOfferId?: string | null;
  subscriptionOfferTitle?: string | null;
  items: {
    id: string;
    productId?: string;
    quantity: number;
    productNameSnapshot: string;
    optionsSnapshot: string | null;
  }[];
};

export function groupCollectionDays(orders: CollectionOrderView[]) {
  const groups = new Map<
    string,
    {
      key: string;
      label: string;
      orders: CollectionOrderView[];
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

export function dayMakeListMeta(orders: CollectionOrderView[]) {
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
