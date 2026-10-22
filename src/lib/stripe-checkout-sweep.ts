import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@/generated/prisma/client";
import { demoStripeAccountId } from "@/lib/demo";
import { stripeClientForLivemode } from "@/lib/stripe-demo";
import {
  CARD_CHECKOUT_TTL_SECONDS,
  completePaidCardCheckout,
  expirePendingCardOrder,
} from "@/lib/stripe-card-checkout";

const GRACE_MS = 15 * 60 * 1000;
/** Past Stripe's 24h max session life - a session we can't read can no longer be paid. */
const UNREADABLE_EXPIRE_MS = 48 * 60 * 60 * 1000;

export type CheckoutSweepResult = {
  checked: number;
  expired: number;
  fulfilled: number;
  errors: number;
};

/** Reconcile pending card orders against their Stripe Checkout sessions. */
export async function sweepPendingCardCheckouts(
  limit = 100,
): Promise<CheckoutSweepResult> {
  const cutoff = new Date(
    Date.now() - CARD_CHECKOUT_TTL_SECONDS * 1000 - GRACE_MS,
  );
  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: PaymentStatus.PENDING,
      stripeCheckoutSessionId: { not: null },
      createdAt: { lt: cutoff },
    },
    select: {
      id: true,
      createdAt: true,
      stripeCheckoutSessionId: true,
      owner: { select: { stripeAccountId: true } },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  const result: CheckoutSweepResult = {
    checked: 0,
    expired: 0,
    fulfilled: 0,
    errors: 0,
  };

  for (const order of orders) {
    const sessionId = order.stripeCheckoutSessionId;
    if (!sessionId) continue;
    const livemode = sessionId.startsWith("cs_live_");
    const stripe = stripeClientForLivemode(livemode);
    const account = livemode
      ? order.owner.stripeAccountId
      : demoStripeAccountId() ?? order.owner.stripeAccountId;
    const ageMs = Date.now() - order.createdAt.getTime();
    result.checked += 1;
    if (!stripe || !account) {
      if (ageMs > UNREADABLE_EXPIRE_MS) {
        result.expired += await expirePendingCardOrder(order.id);
      }
      continue;
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(
        sessionId,
        {},
        { stripeAccount: account },
      );
      if (session.status === "complete" && session.payment_status === "paid") {
        await completePaidCardCheckout(session, livemode, account);
        result.fulfilled += 1;
      } else if (session.status === "expired") {
        result.expired += await expirePendingCardOrder(order.id);
      }
    } catch (error) {
      if (ageMs > UNREADABLE_EXPIRE_MS) {
        result.expired += await expirePendingCardOrder(order.id);
      } else {
        result.errors += 1;
        console.error("Checkout sweep could not read session", order.id, error);
      }
    }
  }

  return result;
}
