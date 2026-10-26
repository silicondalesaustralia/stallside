"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { syncPayPalRefund } from "@/lib/paypal-refunds";
import { issueOrderRefund } from "@/lib/refunds/issue-order-refund";
import { RefundUnavailableError } from "@/lib/refunds/order-refund-context";

export async function refundCardOrder(input: {
  orderId: string;
  amountCents: number;
  restock: boolean;
}): Promise<{ ok: boolean; message: string }> {
  const { owner } = await requireOwnerWrite();
  try {
    const result = await issueOrderRefund({ ownerId: owner.id, ...input });
    if (!result.ok) return { ok: false, message: result.error };
    return {
      ok: true,
      message: result.fullyRefunded ? "Order fully refunded." : "Partial refund sent.",
    };
  } catch (error) {
    if (error instanceof RefundUnavailableError) return { ok: false, message: error.message };
    console.error("Card refund failed", error);
    return { ok: false, message: "Couldn't reach the payment provider. Try again shortly." };
  }
}

export async function checkPayPalRefund(
  orderId: string,
): Promise<{ message: string }> {
  const { owner } = await requireOwnerWrite();
  const order = await prisma.order.findFirst({
    where: { id: orderId, ownerId: owner.id },
    select: { id: true, currency: true },
  });
  if (!order) return { message: "Order not found." };

  try {
    const result = await syncPayPalRefund(order.id);
    revalidatePath("/dashboard/orders");
    if (result.fullyRefunded) return { message: "Fully refunded." };
    if (result.refundedCents > 0) {
      return {
        message: `Partially refunded ${formatMoney(result.refundedCents, order.currency)}.`,
      };
    }
    return { message: "No refund found in PayPal yet." };
  } catch (error) {
    console.error("PayPal refund check failed", error);
    return { message: "Couldn't reach PayPal. Try again shortly." };
  }
}
