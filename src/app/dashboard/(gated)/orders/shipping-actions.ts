"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwnerWrite } from "@/lib/session";
import { notifyOrderShipment } from "@/lib/notify-shipping";
import { resolveTrackingUrl } from "@/lib/shipping/carriers";

export type ShipActionState = { ok?: string; error?: string } | null;

async function ownedShippedOrder(orderId: string) {
  const { owner } = await requireOwnerWrite();
  return prisma.order.findFirst({
    where: { id: orderId, ownerId: owner.id, handoverMode: "DELIVER" },
    select: { id: true, shippedAt: true },
  });
}

/** Save carrier + tracking, mark shipped and email the customer. Saving again updates the tracking. */
export async function markOrderShipped(
  orderId: string,
  _prev: ShipActionState,
  formData: FormData,
): Promise<ShipActionState> {
  try {
    const order = await ownedShippedOrder(orderId);
    if (!order) return { error: "Order not found." };
    const carrier = String(formData.get("carrier") ?? "").trim().slice(0, 60);
    const trackingNumber = String(formData.get("trackingNumber") ?? "").trim().slice(0, 100);
    const rawUrl = String(formData.get("trackingUrl") ?? "").trim().slice(0, 500);
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
    revalidatePath("/dashboard/orders");
    return { ok: emailed ? "Marked shipped and emailed the customer." : "Marked shipped (no customer email on file)." };
  } catch (error) {
    console.error("markOrderShipped failed", error);
    return { error: "Could not save. Try again." };
  }
}

export async function markOrderDelivered(orderId: string, _prev: ShipActionState): Promise<ShipActionState> {
  try {
    const order = await ownedShippedOrder(orderId);
    if (!order) return { error: "Order not found." };
    await prisma.order.update({
      where: { id: order.id },
      data: { deliveredAt: new Date(), shippedAt: order.shippedAt ?? new Date() },
    });
    const emailed = await notifyOrderShipment(order.id, "delivered");
    revalidatePath("/dashboard/orders");
    return { ok: emailed ? "Marked delivered and emailed the customer." : "Marked delivered (no customer email on file)." };
  } catch (error) {
    console.error("markOrderDelivered failed", error);
    return { error: "Could not save. Try again." };
  }
}
