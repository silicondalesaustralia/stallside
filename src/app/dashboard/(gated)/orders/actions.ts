"use server";

import { requireOwnerWrite } from "@/lib/session";
import { deleteOwnerOrder } from "@/lib/orders/service";

export async function deleteOrder(orderId: string) {
  const { owner } = await requireOwnerWrite();
  return deleteOwnerOrder(owner.id, orderId);
}
