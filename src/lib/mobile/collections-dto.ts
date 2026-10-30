import type { CollectionDay, CollectionOrder } from "@/contracts/mobile/collections";
import { dayMakeListMeta, type CollectionOrderView } from "@/lib/collections/group-collections";
import type { CollectionPageGroup } from "@/lib/collections/group-collection-pages";
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

/** Same page grouping, make list and deliveries as the web Pick Ups & Delivery page. */
export function toCollectionDays(groups: CollectionPageGroup[]): CollectionDay[] {
  return groups.map((group) => {
    const { skus, suburbs } = dayMakeListMeta(group.orders);
    return {
      key: group.key,
      title: group.title,
      label: group.collectionLabel,
      deliveries: suburbs,
      emailableCount: group.orders.filter((order) => order.receiptEmail).length,
      windowClosed: group.windowClosed,
      itemCount: group.itemCount,
      takenCents: group.takenCents,
      currency: group.currency,
      makeList: skus,
      orders: group.orders.map(toOrder),
    };
  });
}
