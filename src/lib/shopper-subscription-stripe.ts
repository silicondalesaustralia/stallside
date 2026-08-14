import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import {
  stripeRecurringFromInterval,
  type ShopperInterval,
} from "@/lib/subscription-offer";

/** Create or replace recurring Price on the connected account for an offer. */
export async function syncOfferStripePrice(params: {
  stripeAccountId: string;
  title: string;
  currency: string;
  priceCents: number;
  interval: ShopperInterval;
  existingProductId: string | null;
  existingPriceId: string | null;
}): Promise<{ productId: string; priceId: string }> {
  const stripe = getStripe();
  const acct = { stripeAccount: params.stripeAccountId };
  const recurring = stripeRecurringFromInterval(params.interval);

  let productId = params.existingProductId;
  if (!productId) {
    const product = await stripe.products.create(
      { name: params.title, metadata: { purpose: "shopper_subscription" } },
      acct,
    );
    productId = product.id;
  } else {
    await stripe.products.update(
      productId,
      { name: params.title },
      acct,
    );
  }

  if (params.existingPriceId) {
    try {
      await stripe.prices.update(
        params.existingPriceId,
        { active: false },
        acct,
      );
    } catch (error) {
      console.error("Could not archive old Connect price", error);
    }
  }

  const price = await stripe.prices.create(
    {
      product: productId,
      currency: params.currency.toLowerCase(),
      unit_amount: params.priceCents,
      recurring,
      metadata: { purpose: "shopper_subscription" },
    },
    acct,
  );

  return { productId, priceId: price.id };
}

export async function createShopperSubCheckoutSession(params: {
  stripeAccountId: string;
  priceId: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  applicationFeePercent?: number;
  metadata: Record<string, string>;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.create(
    {
      mode: "subscription",
      customer_email: params.customerEmail,
      line_items: [{ price: params.priceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata,
      subscription_data: {
        metadata: params.metadata,
        ...(params.applicationFeePercent != null
          ? { application_fee_percent: params.applicationFeePercent }
          : {}),
      },
    },
    { stripeAccount: params.stripeAccountId },
  );
}

export async function createShopperBillingPortalSession(params: {
  stripeAccountId: string;
  stripeCustomerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripe();
  const acct = { stripeAccount: params.stripeAccountId };
  const existing = await stripe.billingPortal.configurations.list(
    { limit: 1 },
    acct,
  );
  let configurationId = existing.data[0]?.id;
  if (!configurationId) {
    const created = await stripe.billingPortal.configurations.create(
      {
        business_profile: { headline: "Manage your subscription" },
        features: {
          invoice_history: { enabled: true },
          payment_method_update: { enabled: true },
          subscription_cancel: {
            enabled: true,
            mode: "at_period_end",
          },
        },
      },
      acct,
    );
    configurationId = created.id;
  }
  return stripe.billingPortal.sessions.create(
    {
      customer: params.stripeCustomerId,
      return_url: params.returnUrl,
      configuration: configurationId,
    },
    acct,
  );
}

export async function pauseShopperStripeSubscription(params: {
  stripeAccountId: string;
  stripeSubscriptionId: string;
}): Promise<void> {
  const stripe = getStripe();
  await stripe.subscriptions.update(
    params.stripeSubscriptionId,
    { pause_collection: { behavior: "void" } },
    { stripeAccount: params.stripeAccountId },
  );
}

export async function resumeShopperStripeSubscription(params: {
  stripeAccountId: string;
  stripeSubscriptionId: string;
}): Promise<void> {
  const stripe = getStripe();
  await stripe.subscriptions.update(
    params.stripeSubscriptionId,
    { pause_collection: "" },
    { stripeAccount: params.stripeAccountId },
  );
}
