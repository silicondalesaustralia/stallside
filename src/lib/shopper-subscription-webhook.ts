import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { syncShopperSubscriptionFromStripe } from "@/lib/shopper-subscription-sync";
import { fulfillShopperSubscriptionInvoice } from "@/lib/fulfill-shopper-subscription";
import { ShopperSubStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

function isShopperPurpose(meta: Stripe.Metadata | null | undefined): boolean {
  return meta?.purpose === "shopper_subscription";
}

export async function handleShopperCheckoutCompleted(
  session: Stripe.Checkout.Session,
  connectedAccountId: string | undefined,
) {
  if (session.mode !== "subscription") return false;
  if (!isShopperPurpose(session.metadata)) return false;

  const shopperSubId = session.metadata?.shopperSubscriptionId;
  if (!shopperSubId) return true;

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;
  if (!subscriptionId || !connectedAccountId) return true;

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(
    subscriptionId,
    {},
    { stripeAccount: connectedAccountId },
  );
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  await prisma.shopperSubscription.update({
    where: { id: shopperSubId },
    data: {
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: customerId ?? undefined,
      status: ShopperSubStatus.ACTIVE,
    },
  });
  await syncShopperSubscriptionFromStripe(subscription);

  const row = await prisma.shopperSubscription.findUnique({
    where: { id: shopperSubId },
    include: {
      offer: { select: { title: true } },
      stand: { select: { name: true, slug: true } },
    },
  });
  if (row) {
    const { sendShopperSubscriptionWelcome } = await import(
      "@/lib/notify-shopper-subscription"
    );
    void sendShopperSubscriptionWelcome({
      to: row.customerEmail,
      customerName: row.customerName,
      offerTitle: row.offer.title,
      standName: row.stand.name,
      standSlug: row.stand.slug,
      manageToken: row.manageToken,
    }).catch((error) => {
      console.error("Shopper subscription welcome email failed", error);
    });
  }
  return true;
}

export async function handleShopperSubscriptionEvent(
  subscription: Stripe.Subscription,
) {
  if (!isShopperPurpose(subscription.metadata)) return false;
  await syncShopperSubscriptionFromStripe(subscription);
  return true;
}

export async function handleShopperInvoicePaid(invoice: Stripe.Invoice) {
  const purpose =
    invoice.metadata?.purpose ??
    invoice.parent?.subscription_details?.metadata?.purpose;
  if (purpose === "shopper_subscription") {
    await fulfillShopperSubscriptionInvoice(invoice);
    return true;
  }
  // Fallback: known Connect subscription id
  const { subscriptionIdFromInvoice } = await import(
    "@/lib/stripe-invoice-ids"
  );
  const subId = subscriptionIdFromInvoice(invoice);
  if (!subId) return false;
  const hit = await prisma.shopperSubscription.findFirst({
    where: { stripeSubscriptionId: subId },
    select: { id: true },
  });
  if (!hit) return false;
  await fulfillShopperSubscriptionInvoice(invoice);
  return true;
}

export async function handleShopperInvoiceFailed(invoice: Stripe.Invoice) {
  const { subscriptionIdFromInvoice } = await import(
    "@/lib/stripe-invoice-ids"
  );
  const subId = subscriptionIdFromInvoice(invoice);
  if (!subId) return false;
  const updated = await prisma.shopperSubscription.updateMany({
    where: { stripeSubscriptionId: subId },
    data: { status: ShopperSubStatus.PAST_DUE },
  });
  return updated.count > 0;
}
