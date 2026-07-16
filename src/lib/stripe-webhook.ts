import type Stripe from "stripe";
import { cleanEnvSecret, getStripe } from "@/lib/stripe";

/** Platform + Connect + optional test-mode secrets (demo Card) on one URL. */
export function stripeWebhookSecrets(): string[] {
  const secrets = [
    cleanEnvSecret(process.env.STRIPE_WEBHOOK_SECRET),
    cleanEnvSecret(process.env.STRIPE_WEBHOOK_SECRET_CONNECT),
    cleanEnvSecret(process.env.STRIPE_WEBHOOK_SECRET_TEST),
    cleanEnvSecret(process.env.STRIPE_WEBHOOK_SECRET_TEST_CONNECT),
  ].filter((value): value is string => Boolean(value));
  return [...new Set(secrets)];
}

export function constructStripeWebhookEvent(
  body: string,
  signature: string,
): Stripe.Event {
  const secrets = stripeWebhookSecrets();
  if (secrets.length === 0) {
    throw new Error("Webhook secret missing");
  }

  const stripe = getStripe();
  let lastError: unknown;
  for (const secret of secrets) {
    try {
      return stripe.webhooks.constructEvent(body, signature, secret);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Invalid signature");
}
