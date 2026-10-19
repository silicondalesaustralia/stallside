import type { MobileOrderSummary } from "@/contracts/mobile/orders";
import type { StandOrderRow } from "@/lib/orders/service";

export function toMobileOrderSummary(order: StandOrderRow): MobileOrderSummary {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    totalCents: order.totalCents,
    currency: order.currency,
    createdAt: order.createdAt.toISOString(),
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    customerName: order.customerName,
    isPreOrder: order.isPreOrder,
    handoverMode: order.handoverMode,
    collectionStatus: order.collectionStatus,
    shippedAt: order.shippedAt?.toISOString() ?? null,
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    items: order.items.map((item) => ({
      name: item.productNameSnapshot,
      quantity: item.quantity,
    })),
  };
}
