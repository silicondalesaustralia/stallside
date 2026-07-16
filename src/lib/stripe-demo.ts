import Stripe from "stripe";
import { demoStripeAccountId, isDemoStandSlug } from "@/lib/demo";
import { cleanEnvSecret } from "@/lib/env";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

let stripeTestClient: Stripe | null = null;

function platformSecretKey(): string | null {
  return cleanEnvSecret(process.env.STRIPE_SECRET_KEY);
}

/** Dedicated test key, or the platform key when it is already sk_test_. */
export function stripeTestSecretKey(): string | null {
  const dedicated = cleanEnvSecret(process.env.STRIPE_SECRET_KEY_TEST);
  if (dedicated) return dedicated;
  const platform = platformSecretKey();
  if (platform?.startsWith("sk_test_")) return platform;
  return null;
}

export function isStripeTestConfigured(): boolean {
  return Boolean(stripeTestSecretKey());
}

export function getStripeTest(): Stripe {
  const key = stripeTestSecretKey();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY_TEST is not set (and platform key is not sk_test)");
  }
  if (/[^\x20-\x7E]/.test(key)) {
    throw new Error(
      "STRIPE_SECRET_KEY_TEST has invalid characters — remove quotes/newlines in Vercel env",
    );
  }
  const platform = platformSecretKey();
  if (platform && key === platform) return getStripe();
  if (!stripeTestClient) stripeTestClient = new Stripe(key);
  return stripeTestClient;
}

export function tryGetStripeTest(): Stripe | null {
  try {
    return isStripeTestConfigured() ? getStripeTest() : null;
  } catch {
    return null;
  }
}

type OwnerStripe = {
  stripeAccountId?: string | null;
  stripeChargesEnabled?: boolean;
};

/** Connect account + Stripe client for demo Card checkout. */
export function resolveDemoCardStripe(owner: OwnerStripe): {
  stripe: Stripe;
  stripeAccountId: string;
} | null {
  if (!isStripeTestConfigured()) return null;
  const dedicated = demoStripeAccountId();
  const accountId =
    dedicated ||
    (platformSecretKey()?.startsWith("sk_test_")
      ? owner.stripeAccountId
      : null);
  if (!accountId) return null;
  if (!dedicated && !owner.stripeChargesEnabled) return null;
  return { stripe: getStripeTest(), stripeAccountId: accountId };
}

export function isDemoCardReady(standSlug: string, owner: OwnerStripe): boolean {
  if (!isDemoStandSlug(standSlug)) return false;
  return resolveDemoCardStripe(owner) != null;
}

/** Stripe client matching an event’s livemode (for webhooks / success page). */
export function stripeClientForLivemode(livemode: boolean): Stripe | null {
  if (livemode) return isStripeConfigured() ? getStripe() : null;
  return tryGetStripeTest();
}
