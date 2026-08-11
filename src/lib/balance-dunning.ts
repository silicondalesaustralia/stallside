import { APP_NAME } from "@/lib/constants";
import {
  chargeOrderBalance,
  balanceAuthUrl,
  releaseStockForCancelledOrder,
} from "@/lib/deposit-order";
import { escapeHtml } from "@/lib/lifecycle-emails/html";
import { formatMoney } from "@/lib/money";
import { sendOwnerEmail } from "@/lib/notify-email";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, PaymentTiming } from "@/generated/prisma/client";

const MAX_RETRIES = 3;
/** Days after balanceDueAt / last fail: attempt 0, +2, +5 */
const RETRY_DAY_OFFSETS = [0, 2, 5];

function daysSince(from: Date, now: Date): number {
  return Math.floor((now.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
}

async function emailBuyerBalanceAuth(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { stand: true },
  });
  if (!order?.receiptEmail) return;
  const amount = formatMoney(order.balanceCents ?? 0, order.currency);
  const url = balanceAuthUrl(order.id);
  const greet = order.customerName
    ? `Hi ${escapeHtml(order.customerName)},`
    : "Hi,";
  await sendOwnerEmail(
    order.receiptEmail,
    `[${APP_NAME}] Complete payment for ${order.stand.name}`,
    `<p>${greet}</p>
     <p>We could not charge the remaining <strong>${escapeHtml(amount)}</strong> for order <strong>${escapeHtml(order.orderNumber)}</strong>.</p>
     <p><a href="${escapeHtml(url)}">Authenticate or update your card</a> so your order can proceed.</p>`,
    { kind: "balance_dunning" },
  );
}

async function emailSellerBalanceFailed(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { stand: true, owner: true },
  });
  if (!order) return;
  const to = order.owner.contactEmail;
  const amount = formatMoney(order.balanceCents ?? 0, order.currency);
  await sendOwnerEmail(
    to,
    `[${APP_NAME}] Balance failed · ${order.orderNumber}`,
    `<p>The balance charge of <strong>${escapeHtml(amount)}</strong> for <strong>${escapeHtml(order.customerName ?? "a buyer")}</strong> at ${escapeHtml(order.stand.name)} failed.</p>
     <p>We are retrying and have emailed the buyer. The order stays on hold until the balance clears.</p>`,
    { kind: "balance_failed_owner" },
  );
}

/**
 * Charge balances that are due; dunning retries; cancel + release stock after max retries.
 */
export async function runBalanceDunningCron(now = new Date()): Promise<{
  charged: number;
  failed: number;
  cancelled: number;
  skipped: number;
}> {
  let charged = 0;
  let failed = 0;
  let cancelled = 0;
  let skipped = 0;

  const due = await prisma.order.findMany({
    where: {
      paymentTiming: PaymentTiming.DEPOSIT_THEN_BALANCE,
      paymentStatus: {
        in: [
          PaymentStatus.DEPOSIT_PAID,
          PaymentStatus.BALANCE_DUE,
          PaymentStatus.BALANCE_FAILED,
        ],
      },
      balanceDueAt: { lte: now },
    },
    orderBy: { balanceDueAt: "asc" },
    take: 100,
  });

  for (const order of due) {
    const retry = order.balanceRetryCount;
    if (retry >= MAX_RETRIES) {
      await prisma.$transaction(async (tx) => {
        await releaseStockForCancelledOrder(order.id, tx);
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: PaymentStatus.CANCELLED,
            collectionStatus: null,
          },
        });
      });
      cancelled += 1;
      continue;
    }

    const anchor = order.balanceLastFailedAt ?? order.balanceDueAt ?? now;
    const day = daysSince(anchor, now);
    const allowedDay = RETRY_DAY_OFFSETS[retry] ?? 0;
    if (retry > 0 && day < allowedDay) {
      skipped += 1;
      continue;
    }

    if (order.paymentStatus === PaymentStatus.DEPOSIT_PAID) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: PaymentStatus.BALANCE_DUE },
      });
    }

    const result = await chargeOrderBalance(order.id);
    if (result.ok) {
      charged += 1;
      continue;
    }

    failed += 1;
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: PaymentStatus.BALANCE_FAILED,
        balanceRetryCount: { increment: 1 },
        balanceLastFailedAt: now,
      },
    });
    try {
      await emailBuyerBalanceAuth(order.id);
    } catch (e) {
      console.error("Buyer dunning email failed", e);
    }
    try {
      await emailSellerBalanceFailed(order.id);
    } catch (e) {
      console.error("Seller balance-failed email failed", e);
    }
  }

  return { charged, failed, cancelled, skipped };
}
