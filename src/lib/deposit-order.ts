import {
  PaymentStatus,
  PaymentTiming,
  type Prisma,
} from "@/generated/prisma/client";
import { depositOutstandingCapCents } from "@/lib/deposit-liability";
import { prisma } from "@/lib/prisma";
import { appBaseUrl, getStripe } from "@/lib/stripe";
import { computeVendlCheckoutFees } from "@/lib/stallside-fee";

export function splitDepositBalance(
  totalCents: number,
  depositPercent: number,
): { depositCents: number; balanceCents: number } {
  const pct = Math.min(99, Math.max(1, Math.round(depositPercent)));
  const depositCents = Math.max(1, Math.round((totalCents * pct) / 100));
  const balanceCents = Math.max(0, totalCents - depositCents);
  return { depositCents, balanceCents };
}

/** Sum of deposit principal still outstanding (deposit paid, balance not cleared). */
export async function outstandingDepositPrincipalCents(
  ownerId: string,
): Promise<number> {
  const rows = await prisma.order.findMany({
    where: {
      ownerId,
      paymentTiming: PaymentTiming.DEPOSIT_THEN_BALANCE,
      paymentStatus: {
        in: [
          PaymentStatus.DEPOSIT_PAID,
          PaymentStatus.BALANCE_DUE,
          PaymentStatus.BALANCE_FAILED,
        ],
      },
    },
    select: { depositCents: true },
  });
  return rows.reduce((s, r) => s + (r.depositCents ?? 0), 0);
}

export async function assertDepositLiabilityOk(
  ownerId: string,
  newDepositCents: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const outstanding = await outstandingDepositPrincipalCents(ownerId);
  const cap = depositOutstandingCapCents();
  if (outstanding + newDepositCents > cap) {
    return {
      ok: false,
      error:
        "This stand cannot take more deposit orders right now. Try again later or pay in full.",
    };
  }
  return { ok: true };
}

export function orderFullyPaidForCollection(
  paymentStatus: PaymentStatus,
): boolean {
  return (
    paymentStatus === PaymentStatus.PAID ||
    paymentStatus === PaymentStatus.CUSTOMER_CONFIRMED
  );
}

type OwnerFee = {
  platformFeePercentBps: number;
  subscriptionPlan: string | null;
  passFeeToCustomer: boolean;
  lifetimeAccess: boolean;
};

/** Charge remaining balance off-session on the connected account. */
export async function chargeOrderBalance(orderId: string): Promise<
  | { ok: true }
  | { ok: false; error: string; needsAuth?: boolean }
> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { owner: true, stand: true },
  });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.paymentTiming !== PaymentTiming.DEPOSIT_THEN_BALANCE) {
    return { ok: false, error: "Not a deposit order." };
  }
  if (
    order.paymentStatus !== PaymentStatus.DEPOSIT_PAID &&
    order.paymentStatus !== PaymentStatus.BALANCE_DUE &&
    order.paymentStatus !== PaymentStatus.BALANCE_FAILED
  ) {
    return { ok: false, error: "Balance is not due." };
  }
  const balanceCents = order.balanceCents ?? 0;
  if (balanceCents <= 0) {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: PaymentStatus.PAID },
    });
    return { ok: true };
  }
  if (!order.stripePaymentMethodId) {
    return { ok: false, error: "No saved card for balance.", needsAuth: true };
  }
  if (!order.owner.stripeAccountId || !order.owner.stripeChargesEnabled) {
    return { ok: false, error: "Stripe not connected." };
  }

  const stripe = getStripe();
  const { applicationFeeCents } = computeVendlCheckoutFees(
    balanceCents,
    order.owner as OwnerFee,
  );

  try {
    const pi = await stripe.paymentIntents.create(
      {
        amount: balanceCents,
        currency: order.currency.toLowerCase(),
        payment_method: order.stripePaymentMethodId,
        customer: undefined,
        confirm: true,
        off_session: true,
        metadata: {
          orderId: order.id,
          kind: "balance",
        },
        ...(applicationFeeCents > 0
          ? { application_fee_amount: applicationFeeCents }
          : {}),
      },
      { stripeAccount: order.owner.stripeAccountId },
    );

    if (pi.status === "succeeded") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          balancePaymentIntentId: pi.id,
          balanceRetryCount: order.balanceRetryCount,
          platformFeeCents: order.platformFeeCents + applicationFeeCents,
        },
      });
      return { ok: true };
    }

    if (pi.status === "requires_action" || pi.status === "requires_confirmation") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.BALANCE_FAILED,
          balancePaymentIntentId: pi.id,
          balanceLastFailedAt: new Date(),
        },
      });
      return {
        ok: false,
        error: "Buyer authentication required.",
        needsAuth: true,
      };
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: PaymentStatus.BALANCE_FAILED,
        balancePaymentIntentId: pi.id,
        balanceLastFailedAt: new Date(),
      },
    });
    return { ok: false, error: `Payment status: ${pi.status}` };
  } catch (error) {
    const message =
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof (error as { message: unknown }).message === "string"
        ? (error as { message: string }).message
        : "Balance charge failed.";
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: PaymentStatus.BALANCE_FAILED,
        balanceLastFailedAt: new Date(),
      },
    });
    const needsAuth =
      message.toLowerCase().includes("authentication") ||
      message.toLowerCase().includes("insufficient");
    return { ok: false, error: message, needsAuth };
  }
}

export async function releaseStockForCancelledOrder(
  orderId: string,
  tx?: Prisma.TransactionClient,
) {
  const client = tx ?? prisma;
  const order = await client.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return;
  for (const item of order.items) {
    await client.product.update({
      where: { id: item.productId },
      data: { stockQuantity: { increment: item.quantity } },
    });
  }
}

export function balanceAuthUrl(orderId: string): string {
  return `${appBaseUrl()}/checkout/balance/${orderId}`;
}
