import { prisma } from "@/lib/prisma";
import { PaymentMethod, PaymentStatus, type Prisma } from "@/generated/prisma/client";
import { isCountedPaymentStatus } from "@/lib/order-metrics";
import { revalidateOrderViews } from "@/lib/orders/service";
import { loadOrderRefundContext, type OrderRefundContext } from "./order-refund-context";

export type RefundTotals = { refundedCents: number; fullyRefunded: boolean };

export function refundTotals(ctx: OrderRefundContext): RefundTotals {
  const collected = ctx.payments.reduce((sum, p) => sum + p.amountCents, 0);
  const refundedCents = ctx.payments.reduce((sum, p) => sum + p.refundedCents, 0);
  return { refundedCents, fullyRefunded: collected > 0 && refundedCents >= collected };
}

/** Store refund totals; a full refund of a live order marks it REFUNDED. */
export async function saveRefundTotals(
  ctx: OrderRefundContext,
  totals: RefundTotals,
  tx: Prisma.TransactionClient = prisma,
): Promise<{ becameRefunded: boolean }> {
  const becameRefunded =
    totals.fullyRefunded && isCountedPaymentStatus(ctx.order.paymentStatus);
  await tx.order.update({
    where: { id: ctx.order.id },
    data: {
      refundedCents: totals.refundedCents > 0 ? totals.refundedCents : null,
      ...(becameRefunded ? { paymentStatus: PaymentStatus.REFUNDED } : {}),
    },
  });
  return { becameRefunded };
}

/** Re-read refunds from Stripe / Square (refunds made outside Vendl). Stock is left alone. */
export async function syncOrderRefunds(orderId: string): Promise<RefundTotals> {
  const ctx = await loadOrderRefundContext(orderId);
  const totals = refundTotals(ctx);
  await saveRefundTotals(ctx, totals);
  revalidateOrderViews();
  return totals;
}

export async function syncRefundsForStripePaymentIntent(paymentIntentId: string) {
  const order = await prisma.order.findFirst({
    where: {
      paymentMethod: PaymentMethod.CARD,
      OR: [
        { stripePaymentIntentId: paymentIntentId },
        { balancePaymentIntentId: paymentIntentId },
      ],
    },
    select: { id: true },
  });
  if (order) await syncOrderRefunds(order.id);
}

export async function syncRefundsForSquarePayment(paymentId: string) {
  const order = await prisma.order.findFirst({
    where: {
      paymentMethod: PaymentMethod.SQUARE,
      OR: [{ squarePaymentId: paymentId }, { balanceSquarePaymentId: paymentId }],
    },
    select: { id: true },
  });
  if (order) await syncOrderRefunds(order.id);
}
