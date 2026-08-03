import type Stripe from "stripe";

type CheckoutMethod = Stripe.Checkout.SessionCreateParams.PaymentMethodType;

/** Stripe Checkout payment_method_types for stand sales. */
export function standCheckoutPaymentMethodTypes(
  preOrder: boolean,
): CheckoutMethod[] {
  // Afterpay prohibits pre-orders; keep those sessions card-only.
  if (preOrder) return ["card"];
  return ["card", "afterpay_clearpay", "klarna", "zip"];
}
