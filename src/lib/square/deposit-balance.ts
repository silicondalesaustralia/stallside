import { PaymentStatus, type Order, type Owner } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { SquareApiError } from "@/lib/square/client";
import { getSquareConnection, getValidSquareAccessToken } from "@/lib/square/connection";
import { createSquarePayment } from "@/lib/square/payments";
import { computeVendlCheckoutFees } from "@/lib/stallside-fee";

export type BalanceChargeResult = { ok: true } | { ok: false; error: string; needsAuth?: boolean };

/**
 * Charge a Square deposit order's balance. Without `sourceId` the saved card is
 * charged off-session (cron); with it, the shopper is paying with a new card.
 */
export async function chargeSquareOrderBalance(
  order: Order & { owner: Owner },
  sourceId?: string,
): Promise<BalanceChargeResult> {
  const balanceCents = order.balanceCents ?? 0;
  const savedCard = !sourceId;
  if (savedCard && (!order.squareCardId || !order.squareCustomerId)) {
    return { ok: false, error: "No saved card for balance.", needsAuth: true };
  }
  const conn = await getSquareConnection(order.ownerId);
  const locationId = order.squareLocationId ?? conn?.primaryLocationId;
  const token =
    conn?.status === "ACTIVE" && conn.paymentsEnabled ? await getValidSquareAccessToken(conn.id) : null;
  if (!conn || !token || !locationId) {
    return { ok: false, error: "Square not connected." };
  }

  const { applicationFeeCents } = computeVendlCheckoutFees(balanceCents, order.owner, {
    rail: "square",
    currency: order.currency,
  });
  const source = sourceId ?? order.squareCardId!;
  const markFailed = () =>
    prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: PaymentStatus.BALANCE_FAILED, balanceLastFailedAt: new Date() },
    });

  try {
    const res = await createSquarePayment({
      accessToken: token,
      sourceId: source,
      amountCents: balanceCents,
      currency: order.currency,
      locationId,
      idempotencyKey: `vdb-${order.id}-${order.balanceRetryCount}-${source.slice(-8)}`,
      appFeeCents: applicationFeeCents,
      referenceId: order.orderNumber,
      note: `Vendl ${order.orderNumber} balance`,
      buyerEmail: order.receiptEmail ?? undefined,
      ...(savedCard ? { customerId: order.squareCustomerId!, customerInitiated: false } : {}),
    });
    const payment = res.payment;
    if (payment?.id && payment.status === "COMPLETED") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          balanceSquarePaymentId: payment.id,
          platformFeeCents: order.platformFeeCents + (payment.app_fee_money?.amount ?? 0),
        },
      });
      return { ok: true };
    }
    await markFailed();
    return { ok: false, error: `Payment status: ${payment?.status ?? "not completed"}`, needsAuth: true };
  } catch (error) {
    console.error("Square balance charge failed", order.id, error);
    await markFailed();
    const declined = error instanceof SquareApiError && error.status < 500;
    return {
      ok: false,
      error: declined && error instanceof Error ? `Card was not accepted: ${error.message}` : "Balance charge failed.",
      needsAuth: declined,
    };
  }
}
