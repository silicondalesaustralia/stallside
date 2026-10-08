import { prisma } from "@/lib/prisma";
import { PaymentMethod, PaymentStatus, PaymentTiming } from "@/generated/prisma/client";
import {
  getSquareConnection,
  getValidSquareAccessToken,
} from "@/lib/square/connection";
import { SquareApiError } from "@/lib/square/client";
import { createSquarePayment } from "@/lib/square/payments";
import { ensureDepositSquareCustomer, saveDepositSquareCard } from "@/lib/square/deposit-card";
import { fulfillPaidSquareOrder } from "@/lib/fulfill-paid-order";

export async function chargeAndFulfillSquareOrder(
  orderId: string,
  sourceId: string,
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { owner: true },
  });
  if (!order || order.paymentMethod !== PaymentMethod.SQUARE) {
    return { error: "Order not found." };
  }
  if (order.paymentStatus !== PaymentStatus.PENDING) {
    return { orderNumber: order.orderNumber, alreadyPaid: true as const };
  }
  if (!order.squareLocationId) {
    return { error: "Missing Square location." };
  }

  const conn = await getSquareConnection(order.ownerId);
  if (!conn) return { error: "Square not connected." };
  const token = await getValidSquareAccessToken(conn.id);
  if (!token) return { error: "Square session expired. Reconnect Square." };

  const isDeposit =
    order.paymentTiming === PaymentTiming.DEPOSIT_THEN_BALANCE && (order.balanceCents ?? 0) > 0;
  let customerId: string | undefined;
  if (isDeposit) {
    const ensured = await ensureDepositSquareCustomer(order, token);
    if (typeof ensured !== "string") return ensured;
    customerId = ensured;
  }

  let payment: Awaited<ReturnType<typeof createSquarePayment>>;
  try {
    payment = await createSquarePayment({
      accessToken: token,
      sourceId,
      amountCents: isDeposit ? order.totalCents - (order.balanceCents ?? 0) : order.totalCents,
      currency: order.currency,
      locationId: order.squareLocationId,
      idempotencyKey: `vop-${order.id}-${sourceId.slice(-12)}`,
      appFeeCents: order.platformFeeCents,
      referenceId: order.orderNumber,
      note: isDeposit ? `Vendl ${order.orderNumber} deposit` : `Vendl ${order.orderNumber}`,
      buyerEmail: order.receiptEmail ?? undefined,
      customerId,
    });
  } catch (error) {
    console.error("Square checkout charge failed", order.id, error);
    return {
      error:
        error instanceof SquareApiError && error.status < 500
          ? `Card was not accepted: ${error.message}`
          : "Card payment failed. Try again.",
    };
  }

  const paymentId = payment.payment?.id;
  const status = payment.payment?.status;
  if (!paymentId || (status !== "COMPLETED" && status !== "APPROVED")) {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: PaymentStatus.FAILED },
    });
    return { error: "Card payment was not completed." };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      squarePaymentId: paymentId,
      squareOrderId: payment.payment?.order_id ?? null,
    },
  });
  if (isDeposit && customerId) {
    await saveDepositSquareCard({
      orderId: order.id,
      accessToken: token,
      paymentId,
      customerId,
      referenceId: order.orderNumber,
    });
  }

  const fulfilled = await fulfillPaidSquareOrder(order.id, paymentId);
  if ("error" in fulfilled && fulfilled.error) {
    return { error: fulfilled.error };
  }
  return {
    orderNumber: fulfilled.orderNumber,
    alreadyPaid: fulfilled.alreadyPaid,
  };
}
