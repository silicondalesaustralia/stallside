import type Stripe from "stripe";

/** Stripe Checkout payment_method_types (includes PayTo before SDK types catch up). */
type CheckoutMethod =
  | Stripe.Checkout.SessionCreateParams.PaymentMethodType
  | "payto";

/**
 * Stripe Checkout payment_method_types for stand sales.
 * PayTo is Australia / AUD only and can settle asynchronously - fulfillment
 * must wait for webhooks (`checkout.session.async_payment_succeeded`).
 */
export function standCheckoutPaymentMethodTypes(
  preOrder: boolean,
  currency?: string,
): CheckoutMethod[] {
  // Afterpay prohibits pre-orders; keep those sessions card-only.
  if (preOrder) return ["card"];

  const methods: CheckoutMethod[] = [
    "card",
    "afterpay_clearpay",
    "klarna",
    "zip",
  ];
  if ((currency ?? "").trim().toUpperCase() === "AUD") {
    methods.push("payto");
  }
  return methods;
}
