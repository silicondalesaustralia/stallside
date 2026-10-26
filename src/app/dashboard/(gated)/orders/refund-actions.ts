"use server";

import { revalidatePath } from "next/cache";
import { requireOwnerWrite } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { syncPayPalRefund } from "@/lib/paypal-refunds";

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
