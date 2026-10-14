import { cleanEnvSecret } from "@/lib/env";

type StripeMode = "live" | "test";

function keyForMode(mode: StripeMode, candidates: (string | undefined)[]): string | null {
  for (const raw of candidates) {
    const key = cleanEnvSecret(raw);
    if (key?.startsWith(`pk_${mode}_`)) return key;
  }
  return null;
}

/**
 * Browser key for embedded Stripe Checkout, matching the secret key's mode (live / test).
 * Null when none is configured or `STRIPE_EMBEDDED_CHECKOUT=off`; checkout then redirects to Stripe.
 */
export function stripePublishableKeyFor(secretKeyMode: StripeMode): string | null {
  if (process.env.STRIPE_EMBEDDED_CHECKOUT === "off") return null;
  const shared = [process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, process.env.STRIPE_PUBLISHABLE_KEY];
  return secretKeyMode === "test"
    ? keyForMode("test", [process.env.STRIPE_PUBLISHABLE_KEY_TEST, ...shared])
    : keyForMode("live", shared);
}

/** Live or test, from the platform secret key in use. */
export function platformStripeMode(): StripeMode {
  return cleanEnvSecret(process.env.STRIPE_SECRET_KEY)?.startsWith("sk_test_") ? "test" : "live";
}
