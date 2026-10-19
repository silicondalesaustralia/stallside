import { prisma } from "@/lib/prisma";
import { notifyOrderShipment } from "@/lib/notify-shipping";
import { resolveTrackingUrl } from "@/lib/shipping/carriers";
import { revalidateOrderViews } from "@/lib/orders/service";

export type ShipResult = { ok: string } | { error: string };

function ownedDeliveryOrder(ownerId: string, orderId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, ownerId, handoverMode: "DELIVER" },
    select: { id: true, shippedAt: true },
  });
}

/** Save carrier + tracking, mark shipped and email the customer. Saving again updates the tracking. */
export async function shipOwnerOrder(
  ownerId: string,
  orderId: string,
  input: { carrier: string; trackingNumber: string; trackingUrl: string },
): Promise<ShipResult> {
  const order = await ownedDeliveryOrder(ownerId, orderId);
  if (!order) return { error: "Order not found." };
  const carrier = input.carrier.trim().slice(0, 60);
  const trackingNumber = input.trackingNumber.trim().slice(0, 100);
  const rawUrl = input.trackingUrl.trim().slice(0, 500);
  const trackingUrl = resolveTrackingUrl(carrier, trackingNumber, rawUrl);
  if (rawUrl && !trackingUrl) return { error: "Tracking link must start with https://" };

  await prisma.order.update({
    where: { id: order.id },
    data: {
      shippingCarrier: carrier || null,
      trackingNumber: trackingNumber || null,
      trackingUrl,
      shippedAt: order.shippedAt ?? new Date(),
    },
  });
  const emailed = await notifyOrderShipment(order.id, "shipped");
  revalidateOrderViews();
  return { ok: emailed ? "Marked shipped and emailed the customer." : "Marked shipped (no customer email on file)." };
}

export async function deliverOwnerOrder(ownerId: string, orderId: string): Promise<ShipResult> {
  const order = await ownedDeliveryOrder(ownerId, orderId);
  if (!order) return { error: "Order not found." };
  await prisma.order.update({
    where: { id: order.id },
    data: { deliveredAt: new Date(), shippedAt: order.shippedAt ?? new Date() },
  });
  const emailed = await notifyOrderShipment(order.id, "delivered");
  revalidateOrderViews();
  return { ok: emailed ? "Marked delivered and emailed the customer." : "Marked delivered (no customer email on file)." };
}
