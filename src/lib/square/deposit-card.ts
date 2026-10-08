import { prisma } from "@/lib/prisma";
import { createSquareCustomer, saveSquareCard } from "@/lib/square/customers-cards";

type DepositOrder = {
  id: string;
  orderNumber: string;
  customerName: string | null;
  receiptEmail: string | null;
  customerPhone: string | null;
  squareCustomerId: string | null;
};

/** Square customer the deposit is charged against so the card can be kept for the balance. */
export async function ensureDepositSquareCustomer(
  order: DepositOrder,
  accessToken: string,
): Promise<string | { error: string }> {
  if (order.squareCustomerId) return order.squareCustomerId;
  if (!order.receiptEmail) return { error: "Enter your email to pay a deposit." };
  try {
    const customerId = await createSquareCustomer({
      accessToken,
      idempotencyKey: `vdc-${order.id}`,
      name: order.customerName || order.receiptEmail,
      email: order.receiptEmail,
      phone: order.customerPhone,
      referenceId: order.orderNumber,
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { squareCustomerId: customerId },
    });
    return customerId;
  } catch (error) {
    console.error("Square deposit customer create failed", order.id, error);
    return { error: "Could not set up card payments. Try again." };
  }
}

/** Keep the deposit card on file; if this fails the balance falls back to the pay-by-link email. */
export async function saveDepositSquareCard(input: {
  orderId: string;
  accessToken: string;
  paymentId: string;
  customerId: string;
  referenceId: string;
}): Promise<void> {
  try {
    const card = await saveSquareCard({
      accessToken: input.accessToken,
      idempotencyKey: `vdcard-${input.orderId}`,
      sourceId: input.paymentId,
      customerId: input.customerId,
      referenceId: input.referenceId,
    });
    await prisma.order.update({
      where: { id: input.orderId },
      data: { squareCardId: card.cardId },
    });
  } catch (error) {
    console.error("Square deposit card save failed; balance will ask for a card", input.orderId, error);
  }
}
