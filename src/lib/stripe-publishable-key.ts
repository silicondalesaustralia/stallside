import { cleanEnvSecret } from "@/lib/env";

/** Mode + account part of a Stripe key (`sk_live_51Abc…` → `live:51Abc…`); keys from one account share it. */
function keyAccount(key: string): string | null {
  const m = /^(?:sk|rk|pk)_(live|test)_(.{16})/.exec(key);
  return m ? `${m[1]}:${m[2]}` : null;
}

/**
 * Browser key for embedded Stripe Checkout that belongs to the same account and mode as
 * `secretKey`. Null when none matches or `STRIPE_EMBEDDED_CHECKOUT=off`; checkout then
 * redirects to Stripe's page.
 */
export function stripePublishableKeyFor(secretKey: string | null): string | null {
  if (process.env.STRIPE_EMBEDDED_CHECKOUT === "off" || !secretKey) return null;
  const account = keyAccount(secretKey);
  if (!account) return null;
  const candidates = [
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    process.env.STRIPE_PUBLISHABLE_KEY,
    process.env.STRIPE_PUBLISHABLE_KEY_TEST,
  ];
  for (const raw of candidates) {
    const key = cleanEnvSecret(raw);
    if (key?.startsWith("pk_") && keyAccount(key) === account) return key;
  }
  return null;
}
