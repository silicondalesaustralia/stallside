"use server";

import { requireOwnerWrite } from "@/lib/session";
import { checkOwnerPayPalRefund, refundOwnerCardOrder } from "@/lib/refunds/owner-refunds";

export async function refundCardOrder(input: {
  orderId: string;
  amountCents: number;
  restock: boolean;
}): Promise<{ ok: boolean; message: string }> {
  const { owner } = await requireOwnerWrite();
  return refundOwnerCardOrder({ ownerId: owner.id, ...input });
}

export async function checkPayPalRefund(orderId: string): Promise<{ message: string }> {
  const { owner } = await requireOwnerWrite();
  return checkOwnerPayPalRefund(owner.id, orderId);
}
