import { HandoverMode } from "@/generated/prisma/client";
import type { PrintLabelOrder } from "./CollectionLabelsPrint";

export function toPrintLabelOrders(
  orders: {
    id: string;
    orderNumber: string;
    customerName: string | null;
    handoverMode: HandoverMode;
    collectionLabel: string;
    deliveryAddressLine1: string | null;
    deliverySuburb: string | null;
    deliveryPostcode: string | null;
    items: PrintLabelOrder["items"];
  }[],
): PrintLabelOrder[] {
  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    handoverLabel:
      order.handoverMode === HandoverMode.DELIVER
        ? `Delivery${order.collectionLabel ? ` · ${order.collectionLabel}` : ""}`
        : `Collect${order.collectionLabel ? ` · ${order.collectionLabel}` : ""}`,
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
  }));
}
