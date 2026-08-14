import type Stripe from "stripe";
import { ShopperSubStatus } from "@/generated/prisma/client";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { syncShopperSubscriptionFromStripe } from "@/lib/shopper-subscription-sync";

function customerIdFromSession(
  session: Stripe.Checkout.Session,
): string | null {
  return typeof session.customer === "string"
    ? session.customer
    : session.customer?.id ?? null;
}

function subscriptionIdFromSession(
  session: Stripe.Checkout.Session,
): string | null {
  return typeof session.subscription === "string"
    ? session.subscription
    : session.subscription?.id ?? null;
}

/** Activate a shopper sub from a completed Connect Checkout session. */
export async function activateShopperSubscriptionFromCheckout(params: {
  session: Stripe.Checkout.Session;
  stripeAccountId: string;
  sendWelcome?: boolean;
}): Promise<boolean> {
  const { session, stripeAccountId } = params;
  if (session.mode !== "subscription") return false;
  if (session.metadata?.purpose !== "shopper_subscription") return false;

  const shopperSubId = session.metadata?.shopperSubscriptionId;
  const subscriptionId = subscriptionIdFromSession(session);
  if (!shopperSubId || !subscriptionId) return false;

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(
    subscriptionId,
    {},
    { stripeAccount: stripeAccountId },
  );

  await prisma.shopperSubscription.update({
    where: { id: shopperSubId },
    data: {
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: customerIdFromSession(session) ?? undefined,
      status: ShopperSubStatus.ACTIVE,
    },
  });
  await syncShopperSubscriptionFromStripe(subscription);

  if (params.sendWelcome !== false) {
    const row = await prisma.shopperSubscription.findUnique({
      where: { id: shopperSubId },
      include: {
        offer: { select: { title: true } },
        stand: { select: { name: true, slug: true } },
      },
    });
    if (row?.status === ShopperSubStatus.ACTIVE) {
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
  }
  return true;
}

/** Heal incomplete rows after Checkout succeeded but webhook missed activation. */
export async function healIncompleteShopperSubscription(params: {
  shopperSubscriptionId: string;
  stripeAccountId: string;
}): Promise<boolean> {
  const row = await prisma.shopperSubscription.findUnique({
    where: { id: params.shopperSubscriptionId },
  });
  if (!row || row.status !== ShopperSubStatus.INCOMPLETE) return false;

  const stripe = getStripe();
  const sessions = await stripe.checkout.sessions.list(
    { limit: 40, status: "complete" },
    { stripeAccount: params.stripeAccountId },
  );
  const match = sessions.data.find(
    (s) =>
      s.mode === "subscription" &&
      s.metadata?.shopperSubscriptionId === params.shopperSubscriptionId,
  );
  if (!match) return false;
  return activateShopperSubscriptionFromCheckout({
    session: match,
    stripeAccountId: params.stripeAccountId,
  });
}
