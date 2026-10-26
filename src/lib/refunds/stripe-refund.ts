import type Stripe from "stripe";
import type { PaymentState } from "./payment-state";

export async function stripePaymentState(
  stripe: Stripe,
  stripeAccount: string,
  paymentIntentId: string,
): Promise<PaymentState> {
  const pi = await stripe.paymentIntents.retrieve(
    paymentIntentId,
    { expand: ["latest_charge"] },
    { stripeAccount },
  );
  const charge = typeof pi.latest_charge === "object" ? pi.latest_charge : null;
  return {
    id: pi.id,
    amountCents: charge?.amount ?? pi.amount_received,
    refundedCents: charge?.amount_refunded ?? 0,
    appFeeCents: 0,
  };
}

/** Direct charge on the seller's account; `refund_application_fee` returns Vendl's fee pro rata. */
export async function refundStripePayment(input: {
  stripe: Stripe;
  stripeAccount: string;
  paymentIntentId: string;
  amountCents: number;
  idempotencyKey: string;
}) {
  return input.stripe.refunds.create(
    {
      payment_intent: input.paymentIntentId,
      amount: input.amountCents,
      refund_application_fee: true,
      reason: "requested_by_customer",
    },
    { stripeAccount: input.stripeAccount, idempotencyKey: input.idempotencyKey },
  );
}
