import { prisma } from "@/lib/prisma";

const detailSelect = {
  id: true,
  orderNumber: true,
  totalCents: true,
  currency: true,
  createdAt: true,
  paymentMethod: true,
  localTransferMethodId: true,
  paymentStatus: true,
  paymentTiming: true,
  depositCents: true,
  refundedCents: true,
  paypalCaptureId: true,
  stripePaymentIntentId: true,
  squarePaymentId: true,
  customerName: true,
  customerPhone: true,
  receiptEmail: true,
  isPreOrder: true,
  shopperSubscriptionId: true,
  handoverMode: true,
  deliveryAddressLine1: true,
  deliverySuburb: true,
  deliveryPostcode: true,
  deliveryNotes: true,
  shippingCarrier: true,
  trackingNumber: true,
  trackingUrl: true,
  shippedAt: true,
  deliveredAt: true,
  stand: { select: { name: true } },
  items: {
    select: {
      id: true,
      quantity: true,
      productNameSnapshot: true,
      optionsSnapshot: true,
      lineTotalCents: true,
    },
  },
} as const;

/** One of the owner's orders with everything the dashboard order row shows; null if not theirs. */
export function getOwnerOrder(ownerId: string, orderId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, ownerId },
    select: detailSelect,
  });
}

export type OwnerOrderDetail = NonNullable<Awaited<ReturnType<typeof getOwnerOrder>>>;
