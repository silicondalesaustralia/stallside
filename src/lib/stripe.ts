import Stripe from "stripe";
import { appBaseUrl } from "@/lib/app-url";

export { appBaseUrl };

let stripeClient: Stripe | null = null;

/**
 * Single Stripe *platform* account powers both:
 * - Billing: owners pay Stallside (subscriptions)
 * - Connect: owners receive stand customer payments
 */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/** Platform Billing product price for the cash SaaS plan. */
export function getCashPlanPriceId(): string {
  const id = process.env.STRIPE_PRICE_ID_CASH;
  if (!id) {
    throw new Error("STRIPE_PRICE_ID_CASH is not set");
  }
  return id;
}

export function isStripeBillingConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID_CASH);
}
