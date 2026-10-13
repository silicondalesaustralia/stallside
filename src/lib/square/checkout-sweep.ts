import { prisma } from "@/lib/prisma";
import { PaymentMethod, PaymentStatus } from "@/generated/prisma/client";
import { getSquareConnection, getValidSquareAccessToken } from "@/lib/square/connection";
import { findSquarePaymentByReference } from "@/lib/square/payments";
import { fulfillPaidSquareOrder } from "@/lib/fulfill-paid-order";
import { expirePendingCardOrder } from "@/lib/stripe-card-checkout";
import type { CheckoutSweepResult } from "@/lib/stripe-checkout-sweep";

/** Card form left open longer than this is treated as abandoned. */
const SQUARE_CHECKOUT_TTL_MS = 60 * 60 * 1000;
const UNREADABLE_EXPIRE_MS = 48 * 60 * 60 * 1000;

/** Expire Square card orders the shopper never paid for; rescue any that were charged. */
export async function sweepPendingSquareCheckouts(
  limit = 100,
): Promise<CheckoutSweepResult> {
  const orders = await prisma.order.findMany({
    where: {
      paymentMethod: PaymentMethod.SQUARE,
      paymentStatus: PaymentStatus.PENDING,
      squarePaymentId: null,
      createdAt: { lt: new Date(Date.now() - SQUARE_CHECKOUT_TTL_MS) },
    },
    select: {
      id: true,
      ownerId: true,
      orderNumber: true,
      createdAt: true,
      squareLocationId: true,
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  const result: CheckoutSweepResult = { checked: 0, expired: 0, fulfilled: 0, errors: 0 };

  for (const order of orders) {
    result.checked += 1;
    const ageMs = Date.now() - order.createdAt.getTime();
    try {
      const conn = await getSquareConnection(order.ownerId);
      const token = conn ? await getValidSquareAccessToken(conn.id) : null;
      if (!token || !order.squareLocationId) {
        if (ageMs > UNREADABLE_EXPIRE_MS) {
          result.expired += await expirePendingCardOrder(order.id);
        }
        continue;
      }
      const payment = await findSquarePaymentByReference({
        accessToken: token,
        locationId: order.squareLocationId,
        referenceId: order.orderNumber,
        since: order.createdAt,
        until: new Date(order.createdAt.getTime() + 2 * SQUARE_CHECKOUT_TTL_MS),
      });
      if (payment?.id) {
        await fulfillPaidSquareOrder(order.id, payment.id);
        result.fulfilled += 1;
      } else {
        result.expired += await expirePendingCardOrder(order.id);
      }
    } catch (error) {
      result.errors += 1;
      console.error("Square checkout sweep failed", order.id, error);
    }
  }

  return result;
}
