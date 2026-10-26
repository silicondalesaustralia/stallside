import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { PaymentMethod } from "@/generated/prisma/client";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getSquareConnection, getValidSquareAccessToken } from "@/lib/square/connection";
import type { PaymentState } from "./payment-state";
import { stripePaymentState } from "./stripe-refund";
import { squarePaymentState } from "./square-refund";

export type RefundRail =
  | { kind: "stripe"; stripe: Stripe; stripeAccount: string }
  | { kind: "square"; accessToken: string };

export type OrderRefundContext = {
  order: {
    id: string;
    currency: string;
    totalCents: number;
    paymentStatus: string;
    refundedCents: number | null;
  };
  rail: RefundRail;
  /** Oldest first: deposit (or only payment), then balance. */
  payments: PaymentState[];
};

function present(ids: (string | null)[]): string[] {
  return ids.filter((id): id is string => Boolean(id));
}

export class RefundUnavailableError extends Error {}

/** Live payment state from Stripe / Square for a card order, scoped to its owner when given. */
export async function loadOrderRefundContext(
  orderId: string,
  ownerId?: string,
): Promise<OrderRefundContext> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, ...(ownerId ? { ownerId } : {}) },
    select: {
      id: true,
      ownerId: true,
      currency: true,
      totalCents: true,
      paymentStatus: true,
      refundedCents: true,
      paymentMethod: true,
      stripePaymentIntentId: true,
      balancePaymentIntentId: true,
      squarePaymentId: true,
      balanceSquarePaymentId: true,
      owner: { select: { stripeAccountId: true } },
    },
  });
  if (!order) throw new RefundUnavailableError("Order not found.");

  if (order.paymentMethod === PaymentMethod.CARD) {
    const account = order.owner.stripeAccountId;
    const ids = present([order.stripePaymentIntentId, order.balancePaymentIntentId]);
    if (!account || !isStripeConfigured() || ids.length === 0) {
      throw new RefundUnavailableError("This order has no Stripe payment to refund.");
    }
    const stripe = getStripe();
    const payments = await Promise.all(ids.map((id) => stripePaymentState(stripe, account, id)));
    return { order, rail: { kind: "stripe", stripe, stripeAccount: account }, payments };
  }

  if (order.paymentMethod === PaymentMethod.SQUARE) {
    const ids = present([order.squarePaymentId, order.balanceSquarePaymentId]);
    const conn = await getSquareConnection(order.ownerId);
    const accessToken = conn ? await getValidSquareAccessToken(conn.id) : null;
    if (!accessToken) {
      throw new RefundUnavailableError("Reconnect Square in Settings to refund this order.");
    }
    if (ids.length === 0) {
      throw new RefundUnavailableError("This order has no Square payment to refund.");
    }
    const payments = await Promise.all(ids.map((id) => squarePaymentState(accessToken, id)));
    return { order, rail: { kind: "square", accessToken }, payments };
  }

  throw new RefundUnavailableError("Only Stripe and Square orders can be refunded here.");
}
