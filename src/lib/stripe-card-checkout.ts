import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { stripeClientForLivemode } from "@/lib/stripe-demo";
import { fulfillPaidCardOrder } from "@/lib/fulfill-paid-order";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@/generated/prisma/client";

/** Stripe's minimum is 30 minutes. */
export const CARD_CHECKOUT_TTL_SECONDS = 60 * 60;

/** Fulfil the order behind a paid one-off card Checkout session. */
export async function completePaidCardCheckout(
  session: Stripe.Checkout.Session,
  livemode: boolean,
  connectedAccountId: string | undefined,
) {
  const orderId = session.metadata?.orderId;
  if (!orderId || session.payment_status !== "paid") return;

  let paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;
  let paymentMethodId: string | null = null;

  const stripeAccount =
    connectedAccountId || session.metadata?.stripeAccountId || null;
  if (paymentIntentId && stripeAccount) {
    try {
      const stripe = stripeClientForLivemode(livemode) ?? getStripe();
      const pi = await stripe.paymentIntents.retrieve(
        paymentIntentId,
        { expand: ["payment_method"] },
        { stripeAccount },
      );
      paymentIntentId = pi.id;
      const pm = pi.payment_method;
      paymentMethodId =
        typeof pm === "string" ? pm : pm && "id" in pm ? pm.id : null;
    } catch (error) {
      console.error("Could not expand payment intent for deposit vault", error);
    }
  }

  await fulfillPaidCardOrder(orderId, paymentIntentId, paymentMethodId);
}

/** Mark a still-pending order as abandoned (Checkout expired or failed). */
export async function expirePendingCardOrder(orderId: string | undefined) {
  if (!orderId) return 0;
  const result = await prisma.order.updateMany({
    where: { id: orderId, paymentStatus: PaymentStatus.PENDING },
    data: { paymentStatus: PaymentStatus.EXPIRED },
  });
  return result.count;
}
