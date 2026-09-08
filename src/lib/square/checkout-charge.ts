import { prisma } from "@/lib/prisma";
import { PaymentMethod, PaymentStatus } from "@/generated/prisma/client";
import {
  getSquareConnection,
  getValidSquareAccessToken,
} from "@/lib/square/connection";
import { createSquarePayment } from "@/lib/square/payments";
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

  const payment = await createSquarePayment({
    accessToken: token,
    sourceId,
    amountCents: order.totalCents,
    currency: order.currency,
    locationId: order.squareLocationId,
    idempotencyKey: `vendl-order-pay-${order.id}`,
    appFeeCents: order.platformFeeCents,
    referenceId: order.orderNumber,
    note: `Vendl ${order.orderNumber}`,
    buyerEmail: order.receiptEmail ?? undefined,
  });

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

  const fulfilled = await fulfillPaidSquareOrder(order.id, paymentId);
  if ("error" in fulfilled && fulfilled.error) {
    return { error: fulfilled.error };
  }
  return {
    orderNumber: fulfilled.orderNumber,
    alreadyPaid: fulfilled.alreadyPaid,
  };
}
