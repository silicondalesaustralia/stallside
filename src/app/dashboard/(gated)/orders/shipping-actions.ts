"use server";

import { requireOwnerWrite } from "@/lib/session";
import { deliverOwnerOrder, shipOwnerOrder } from "@/lib/orders/shipping";

export type ShipActionState = { ok?: string; error?: string } | null;

/** Save carrier + tracking, mark shipped and email the customer. Saving again updates the tracking. */
export async function markOrderShipped(
  orderId: string,
  _prev: ShipActionState,
  formData: FormData,
): Promise<ShipActionState> {
  try {
    const { owner } = await requireOwnerWrite();
    return await shipOwnerOrder(owner.id, orderId, {
      carrier: String(formData.get("carrier") ?? ""),
      trackingNumber: String(formData.get("trackingNumber") ?? ""),
      trackingUrl: String(formData.get("trackingUrl") ?? ""),
    });
  } catch (error) {
    console.error("markOrderShipped failed", error);
    return { error: "Could not save. Try again." };
  }
}

export async function markOrderDelivered(orderId: string, _prev: ShipActionState): Promise<ShipActionState> {
  try {
    const { owner } = await requireOwnerWrite();
    return await deliverOwnerOrder(owner.id, orderId);
  } catch (error) {
    console.error("markOrderDelivered failed", error);
    return { error: "Could not save. Try again." };
  }
}
