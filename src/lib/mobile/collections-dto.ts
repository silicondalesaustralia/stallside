import type { CollectionDay, CollectionOrder } from "@/contracts/mobile/collections";
import {
  dayMakeListMeta,
  groupCollectionDays,
  type CollectionOrderView,
} from "@/lib/collections/group-collections";
import { orderFullyPaidForCollection } from "@/lib/deposit-order";

function toOrder(order: CollectionOrderView): CollectionOrder {
  const fullyPaid = orderFullyPaidForCollection(order.paymentStatus);
  const isDelivery = order.handoverMode === "DELIVER";
  const address = [order.deliveryAddressLine1, order.deliverySuburb, order.deliveryPostcode]
    .filter(Boolean)
    .join(", ");
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    status: order.collectionStatus,
    fullyPaid,
    balanceDueCents: fullyPaid ? null : order.balanceCents,
    totalCents: order.totalCents,
    currency: order.currency,
    isDelivery,
    address: isDelivery ? address || null : null,
    note: order.collectionNote,
    subscriptionTitle: order.subscriptionOfferTitle ?? null,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.optionsSnapshot
        ? `${item.productNameSnapshot} (${item.optionsSnapshot})`
        : item.productNameSnapshot,
      quantity: item.quantity,
    })),
  };
}

/** Same day grouping and make-list as the web Pick Ups & Delivery page. */
export function toCollectionDays(orders: CollectionOrderView[]): CollectionDay[] {
  return groupCollectionDays(orders).map((day) => ({
    key: day.key,
    label: day.label,
    windowClosed: day.windowClosed,
    itemCount: day.itemCount,
    takenCents: day.takenCents,
    currency: day.currency,
    makeList: dayMakeListMeta(day.orders).skus,
    orders: day.orders.map(toOrder),
  }));
}
