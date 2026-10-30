import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { syncPayPalRefund } from "@/lib/paypal-refunds";
import { issueOrderRefund } from "./issue-order-refund";
import { RefundUnavailableError } from "./order-refund-context";

/** Refunds a Stripe or Square order back to the customer's card. */
export async function refundOwnerCardOrder(input: {
  ownerId: string;
  orderId: string;
  amountCents: number;
  restock: boolean;
}): Promise<{ ok: boolean; message: string }> {
  try {
    const result = await issueOrderRefund(input);
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

/** PayPal refunds happen in the seller's PayPal; this reads them back onto the order. */
export async function checkOwnerPayPalRefund(
  ownerId: string,
  orderId: string,
): Promise<{ message: string }> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, ownerId },
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
