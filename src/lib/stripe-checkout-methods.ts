import type Stripe from "stripe";

/**
 * Payment methods for stand Checkout.
 *
 * Normal sales: omit `payment_method_types` so Stripe uses the connected
 * account's Payment Method Configuration (Dashboard defaults: card, wallets,
 * PayTo, BNPL where enabled/eligible).
 *
 * Pre-orders: card only (Afterpay and similar disallow pre-orders).
 */
export function standCheckoutPaymentMethodTypes(
  preOrder: boolean,
): Stripe.Checkout.SessionCreateParams.PaymentMethodType[] | undefined {
  if (preOrder) return ["card"];
  return undefined;
}
