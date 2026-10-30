"use server";

import { requireOwnerWrite } from "@/lib/session";
import { markOwnerOrderPaid } from "@/lib/orders/mark-paid";

/** Owner confirms the cash or PayID money actually arrived. */
export async function markOrderPaid(orderId: string): Promise<{ ok: true } | { error: string }> {
  try {
    const { owner } = await requireOwnerWrite();
    return await markOwnerOrderPaid(owner.id, orderId);
  } catch (error) {
    console.error("[orders] markOrderPaid failed", error);
    return { error: "Could not update the order. Try again." };
  }
}
