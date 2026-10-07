import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { stripeRecurringFromInterval } from "@/lib/subscription-offer";

async function ensureStripeProduct(
  stripe: Stripe,
  acct: { stripeAccount: string },
  title: string,
  existingProductId: string | null,
): Promise<string> {
  if (!existingProductId) {
    const product = await stripe.products.create(
      { name: title, metadata: { purpose: "shopper_subscription" } },
      acct,
    );
    return product.id;
  }
  await stripe.products.update(existingProductId, { name: title }, acct);
  return existingProductId;
}

async function archivePrice(
  stripe: Stripe,
  acct: { stripeAccount: string },
  priceId: string | null,
) {
  if (!priceId) return;
  try {
    await stripe.prices.update(priceId, { active: false }, acct);
  } catch (error) {
    console.error("Could not archive Connect price", error);
  }
}

async function createRecurringPrice(
  stripe: Stripe,
  acct: { stripeAccount: string },
  params: {
    productId: string;
    currency: string;
    priceCents: number;
    interval: "WEEKLY" | "MONTHLY";
  },
): Promise<string> {
  const recurring = stripeRecurringFromInterval(params.interval);
  const price = await stripe.prices.create(
    {
      product: params.productId,
      currency: params.currency.toLowerCase(),
      unit_amount: params.priceCents,
      recurring,
      metadata: { purpose: "shopper_subscription" },
    },
    acct,
  );
  return price.id;
}

/** Sync weekly / monthly / upfront Prices for a membership offer. */
export async function syncMembershipStripePrices(params: {
  stripeAccountId: string;
  title: string;
  currency: string;
  existingProductId: string | null;
  weeklyPriceCents: number | null;
  monthlyPriceCents: number | null;
  upfrontPriceCents: number | null;
  existingWeeklyPriceId: string | null;
  existingMonthlyPriceId: string | null;
  existingUpfrontPriceId: string | null;
}): Promise<{
  productId: string;
  weeklyPriceId: string | null;
  monthlyPriceId: string | null;
  upfrontPriceId: string | null;
}> {
  const stripe = getStripe();
  const acct = { stripeAccount: params.stripeAccountId };
  const productId = await ensureStripeProduct(
    stripe,
    acct,
    params.title,
    params.existingProductId,
  );

  let weeklyPriceId: string | null = null;
  if (params.weeklyPriceCents != null && params.weeklyPriceCents >= 50) {
    await archivePrice(stripe, acct, params.existingWeeklyPriceId);
    weeklyPriceId = await createRecurringPrice(stripe, acct, {
      productId,
      currency: params.currency,
      priceCents: params.weeklyPriceCents,
      interval: "WEEKLY",
    });
  }

  let monthlyPriceId: string | null = null;
  if (params.monthlyPriceCents != null && params.monthlyPriceCents >= 50) {
    await archivePrice(stripe, acct, params.existingMonthlyPriceId);
    monthlyPriceId = await createRecurringPrice(stripe, acct, {
      productId,
      currency: params.currency,
      priceCents: params.monthlyPriceCents,
      interval: "MONTHLY",
    });
  }

  let upfrontPriceId: string | null = null;
  if (params.upfrontPriceCents != null && params.upfrontPriceCents >= 50) {
    await archivePrice(stripe, acct, params.existingUpfrontPriceId);
    const price = await stripe.prices.create(
      {
        product: productId,
        currency: params.currency.toLowerCase(),
        unit_amount: params.upfrontPriceCents,
        metadata: { purpose: "shopper_subscription" },
      },
      acct,
    );
    upfrontPriceId = price.id;
  }

  return { productId, weeklyPriceId, monthlyPriceId, upfrontPriceId };
}

export async function createMembershipTermCheckoutSession(params: {
  stripeAccountId: string;
  priceId: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  applicationFeePercent?: number;
  metadata: Record<string, string>;
  /** Unix seconds; applied after Checkout via subscription update if needed. */
  cancelAtUnix: number;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.create(
    {
      mode: "subscription",
      customer_email: params.customerEmail,
      line_items: [{ price: params.priceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        ...params.metadata,
        cancelAtUnix: String(params.cancelAtUnix),
      },
      subscription_data: {
        metadata: {
          ...params.metadata,
          cancelAtUnix: String(params.cancelAtUnix),
        },
        ...(params.applicationFeePercent != null
          ? { application_fee_percent: params.applicationFeePercent }
          : {}),
      },
    },
    { stripeAccount: params.stripeAccountId },
  );
}

export async function applyMembershipCancelAt(params: {
  stripeAccountId: string;
  stripeSubscriptionId: string;
  cancelAtUnix: number;
}): Promise<void> {
  const stripe = getStripe();
  await stripe.subscriptions.update(
    params.stripeSubscriptionId,
    { cancel_at: params.cancelAtUnix },
    { stripeAccount: params.stripeAccountId },
  );
}

export async function createMembershipUpfrontCheckoutSession(params: {
  stripeAccountId: string;
  priceId: string;
  priceCents: number;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  applicationFeePercent?: number;
  metadata: Record<string, string>;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const feeCents =
    params.applicationFeePercent != null && params.applicationFeePercent > 0
      ? Math.round((params.priceCents * params.applicationFeePercent) / 100)
      : 0;
  return stripe.checkout.sessions.create(
    {
      mode: "payment",
      customer_email: params.customerEmail,
      line_items: [{ price: params.priceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata,
      payment_intent_data: {
        metadata: params.metadata,
        ...(feeCents > 0 ? { application_fee_amount: feeCents } : {}),
      },
    },
    { stripeAccount: params.stripeAccountId },
  );
}
