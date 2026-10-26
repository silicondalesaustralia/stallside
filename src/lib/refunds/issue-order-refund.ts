import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { releaseStockForCancelledOrder } from "@/lib/deposit-order";
import { revalidateOrderViews } from "@/lib/orders/service";
import { allocateRefund, remainingCents, type PaymentState } from "./payment-state";
import { loadOrderRefundContext, type OrderRefundContext } from "./order-refund-context";
import { refundStripePayment } from "./stripe-refund";
import { refundSquare } from "./square-refund";
import { refundTotals, saveRefundTotals } from "./sync-order-refunds";

export type IssueRefundResult =
  | { ok: true; refundedCents: number; fullyRefunded: boolean }
  | { ok: false; error: string };

/** Same click → same key, so a retried request can't refund twice. Square caps keys at 45 chars. */
function refundKey(orderId: string, payment: PaymentState, amountCents: number): string {
  const raw = `${orderId}:${payment.id}:${payment.refundedCents}:${amountCents}`;
  return createHash("sha256").update(raw).digest("hex").slice(0, 40);
}

async function refundOne(ctx: OrderRefundContext, payment: PaymentState, amountCents: number) {
  const idempotencyKey = refundKey(ctx.order.id, payment, amountCents);
  if (ctx.rail.kind === "stripe") {
    await refundStripePayment({
      stripe: ctx.rail.stripe,
      stripeAccount: ctx.rail.stripeAccount,
      paymentIntentId: payment.id,
      amountCents,
      idempotencyKey,
    });
  } else {
    await refundSquare({
      accessToken: ctx.rail.accessToken,
      payment,
      amountCents,
      currency: ctx.order.currency,
      idempotencyKey,
    });
  }
}

export async function issueOrderRefund(input: {
  ownerId: string;
  orderId: string;
  amountCents: number;
  restock: boolean;
}): Promise<IssueRefundResult> {
  const ctx = await loadOrderRefundContext(input.orderId, input.ownerId);
  const remaining = ctx.payments.reduce((sum, p) => sum + remainingCents(p), 0);
  if (remaining <= 0) return { ok: false, error: "This order is already fully refunded." };
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    return { ok: false, error: "Enter an amount to refund." };
  }
  if (input.amountCents > remaining) {
    return { ok: false, error: "That's more than is left to refund on this order." };
  }

  let failure: string | null = null;
  for (const step of allocateRefund(ctx.payments, input.amountCents)) {
    try {
      await refundOne(ctx, step.payment, step.amountCents);
      step.payment.refundedCents += step.amountCents;
    } catch (error) {
      console.error("Order refund failed", { orderId: ctx.order.id, error });
      failure = error instanceof Error ? error.message : "The refund was declined.";
      break;
    }
  }

  const totals = refundTotals(ctx);
  await prisma.$transaction(async (tx) => {
    const { becameRefunded } = await saveRefundTotals(ctx, totals, tx);
    if (becameRefunded && input.restock) {
      await releaseStockForCancelledOrder(ctx.order.id, tx);
    }
  });
  revalidateOrderViews();

  if (failure) return { ok: false, error: failure };
  return { ok: true, ...totals };
}
