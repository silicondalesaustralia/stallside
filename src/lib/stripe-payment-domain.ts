import type Stripe from "stripe";
import { headers } from "next/headers";
import { publicHostnameFromHeaders } from "@/lib/tenancy/request-hostname";

const registered = new Set<string>();

function isRegistrableHost(host: string): boolean {
  return Boolean(host) && host.includes(".") && !host.startsWith("localhost") && !/^[\d.:]+$/.test(host);
}

/**
 * Apple Pay / Google Pay only appear in embedded Checkout on domains registered with the
 * account taking the payment, so register the shopper's current domain on the seller's
 * connected account (once per server instance). Never blocks checkout.
 */
export async function ensurePaymentMethodDomain(stripe: Stripe, stripeAccountId: string): Promise<void> {
  try {
    const host = publicHostnameFromHeaders(await headers());
    if (!isRegistrableHost(host)) return;
    const cacheKey = `${stripeAccountId}:${host}`;
    if (registered.has(cacheKey)) return;
    const existing = await stripe.paymentMethodDomains.list(
      { domain_name: host, limit: 1 },
      { stripeAccount: stripeAccountId },
    );
    if (existing.data.length === 0) {
      await stripe.paymentMethodDomains.create(
        { domain_name: host, enabled: true },
        { stripeAccount: stripeAccountId },
      );
    }
    registered.add(cacheKey);
  } catch (err) {
    console.error("[stripe-payment-domain] could not register domain; wallets may be hidden", err);
  }
}
