import type { MobileOrderDetail } from "@/contracts/mobile/order-detail";
import type { OwnerOrderDetail } from "@/lib/orders/detail";
import { isCountedPaymentStatus } from "@/lib/order-metrics";
import { orderPaymentLabel, paymentStatusNote } from "@/lib/order-payment-label";
import { SHIPPING_CARRIERS } from "@/lib/shipping/carriers";

function channelLabel(order: OwnerOrderDetail): string {
  if (order.shopperSubscriptionId) return "Subscription";
  if (order.isPreOrder) return "Pre Order";
  return "Paid At Stand";
}

function delivery(order: OwnerOrderDetail): MobileOrderDetail["delivery"] {
  if (order.handoverMode !== "DELIVER") return null;
  const address = [
    order.deliveryAddressLine1,
    [order.deliverySuburb, order.deliveryPostcode].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");
  return {
    label: order.isPreOrder ? "Deliver to" : "Ship to",
    address: address || null,
    notes: order.deliveryNotes,
  };
}

export function toMobileOrderDetail(order: OwnerOrderDetail): MobileOrderDetail {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    standName: order.stand.name,
    createdAt: order.createdAt.toISOString(),
    totalCents: order.totalCents,
    currency: order.currency,
    channelLabel: channelLabel(order),
    paymentLabel: orderPaymentLabel(order.paymentMethod, order.localTransferMethodId),
    paymentStatusLabel: paymentStatusNote(order.paymentStatus),
    restoresStockOnDelete: isCountedPaymentStatus(order.paymentStatus),
    customer: {
      name: order.customerName,
      phone: order.customerPhone,
      email: order.receiptEmail,
    },
    delivery: delivery(order),
    canShip: order.handoverMode === "DELIVER" && isCountedPaymentStatus(order.paymentStatus),
    carriers: SHIPPING_CARRIERS.map((carrier) => carrier.name),
    shipping: {
      carrier: order.shippingCarrier,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      shippedAt: order.shippedAt?.toISOString() ?? null,
      deliveredAt: order.deliveredAt?.toISOString() ?? null,
    },
    items: order.items.map((item) => ({
      id: item.id,
      name: item.productNameSnapshot,
      options: item.optionsSnapshot,
      quantity: item.quantity,
      lineTotalCents: item.lineTotalCents,
    })),
  };
}
