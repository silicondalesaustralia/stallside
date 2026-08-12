import { HandoverMode } from "@/generated/prisma/client";
import { formatMoney } from "@/lib/money";
import { formatCollectionLabel } from "@/lib/pre-order";
import { toPrintLabelOrders } from "./to-print-label-orders";
import type { PrintDayGroup } from "./CollectionListPrintSheet";
import { dayMakeListMeta, groupCollectionDays } from "./group-collections";
import type { CollectionOrder } from "./load-collections";

export function buildCollectionsPrintPayload(orders: CollectionOrder[]) {
  const days = groupCollectionDays(orders);

  const printDays: PrintDayGroup[] = days.map((day) => {
    const { skus, suburbs } = dayMakeListMeta(day.orders);
    return {
      key: day.key,
      label: day.label,
      takenLabel: formatMoney(day.takenCents, day.currency),
      windowClosed: day.windowClosed,
      itemCount: day.itemCount,
      skus,
      suburbs,
      orders: day.orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        collectionStatus: order.collectionStatus,
        handoverSummary:
          order.handoverMode === HandoverMode.DELIVER
            ? "Delivery"
            : `Collect${
                order.collectionAt
                  ? ` · ${formatCollectionLabel(order.collectionAt)}`
                  : ""
              }`,
        addressLine:
          order.handoverMode === HandoverMode.DELIVER
            ? [
                order.deliveryAddressLine1,
                order.deliverySuburb,
                order.deliveryPostcode,
              ]
                .filter(Boolean)
                .join(", ") || null
            : null,
        items: order.items,
      })),
    };
  });

  const labelOrders = toPrintLabelOrders(
    orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      handoverMode: order.handoverMode,
      collectionLabel: order.collectionAt
        ? formatCollectionLabel(order.collectionAt)
        : "",
      deliveryAddressLine1: order.deliveryAddressLine1,
      deliverySuburb: order.deliverySuburb,
      deliveryPostcode: order.deliveryPostcode,
      items: order.items,
    })),
  );

  return { days, printDays, labelOrders };
}
