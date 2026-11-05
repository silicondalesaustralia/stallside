import { appBaseUrl, getStripe } from "@/lib/stripe";
import { ensureStripeCustomerForOwner } from "@/lib/domains/stripe-customer";
import type { BillingCurrency } from "@/lib/saas-pricing";
import { DFY_BUILD_PATH, DFY_BUILD_PRICES, DFY_BUILD_PURPOSE, DFY_BUILD_TITLE } from "./dfy-build";

export type DfyBuildBuyer = {
  id: string;
  currency: BillingCurrency;
  email: string | undefined;
  name: string;
  stripeCustomerId: string | null;
};

/** Stripe Checkout for the one-off build fee; returns the hosted checkout URL. */
export async function startDfyBuildCheckout(owner: DfyBuildBuyer, domain: string): Promise<string> {
  const customerId = await ensureStripeCustomerForOwner({
    ownerId: owner.id,
    existingCustomerId: owner.stripeCustomerId,
    email: owner.email,
    name: owner.name,
  });
  const base = appBaseUrl();
  const metadata = { purpose: DFY_BUILD_PURPOSE, ownerId: owner.id, domain };
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: owner.currency.toLowerCase(),
          unit_amount: DFY_BUILD_PRICES[owner.currency],
          product_data: {
            name: `Vendl: ${DFY_BUILD_TITLE}`,
            description: "We build your website and connect your domain.",
          },
        },
      },
    ],
    metadata,
    payment_intent_data: { metadata },
    success_url: `${base}${DFY_BUILD_PATH}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}${DFY_BUILD_PATH}?cancelled=1`,
  });
  if (!session.url) throw new Error("Stripe did not return a checkout link");
  return session.url;
}

/** Return-from-Checkout check, so the thank-you message only shows for a paid session of this owner. */
export async function isDfyBuildSessionPaid(ownerId: string, sessionId: string): Promise<boolean> {
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  return (
    session.metadata?.purpose === DFY_BUILD_PURPOSE &&
    session.metadata.ownerId === ownerId &&
    session.payment_status === "paid"
  );
}
