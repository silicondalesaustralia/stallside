import type Stripe from "stripe";
import {
  MembershipBillingPlan,
  ShopperSubStatus,
  SubscriptionOfferKind,
} from "@/generated/prisma/client";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { syncShopperSubscriptionFromStripe } from "@/lib/shopper-subscription-sync";
import {
  membershipTermEndsAt,
  nextCollectionAt,
} from "@/lib/subscription-offer";

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

async function sendWelcome(shopperSubId: string) {
  const row = await prisma.shopperSubscription.findUnique({
    where: { id: shopperSubId },
    include: {
      offer: { select: { title: true, kind: true } },
      stand: { select: { name: true, slug: true } },
    },
  });
  if (!row || row.status !== ShopperSubStatus.ACTIVE) return;
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
    billingPlan: row.billingPlan,
    termEndsAt: row.termEndsAt,
    collectionsRemaining: row.collectionsRemaining,
    isMembership: row.offer.kind === SubscriptionOfferKind.MEMBERSHIP,
  }).catch((error) => {
    console.error("Shopper subscription welcome email failed", error);
  });
}

function membershipActivateFields(row: {
  billingPlan: MembershipBillingPlan | null;
  termEndsAt: Date | null;
  collectionsRemaining: number | null;
  offer: {
    kind: SubscriptionOfferKind;
    termWeeks: number | null;
    collectionWeekday: number | null;
    interval: string;
  };
}) {
  if (row.offer.kind !== SubscriptionOfferKind.MEMBERSHIP) return {};
  const termWeeks = row.offer.termWeeks ?? row.collectionsRemaining ?? 26;
  const termEndsAt =
    row.termEndsAt ?? membershipTermEndsAt(new Date(), termWeeks);
  const next = nextCollectionAt({
    from: new Date(),
    weekday: row.offer.collectionWeekday,
    interval: "WEEKLY",
  });
  return {
    termEndsAt,
    collectionsRemaining: row.collectionsRemaining ?? termWeeks,
    paidThroughAt:
      row.billingPlan === MembershipBillingPlan.UPFRONT ? termEndsAt : null,
    nextCollectionAt: next,
  };
}

/** Activate a shopper sub from a completed Connect Checkout session. */
export async function activateShopperSubscriptionFromCheckout(params: {
  session: Stripe.Checkout.Session;
  stripeAccountId: string;
  sendWelcome?: boolean;
}): Promise<boolean> {
  const { session, stripeAccountId } = params;
  if (session.metadata?.purpose !== "shopper_subscription") return false;

  const shopperSubId = session.metadata?.shopperSubscriptionId;
  if (!shopperSubId) return false;

  const row = await prisma.shopperSubscription.findUnique({
    where: { id: shopperSubId },
    include: { offer: true },
  });
  if (!row) return false;

  if (session.mode === "payment") {
    await prisma.shopperSubscription.update({
      where: { id: shopperSubId },
      data: {
        stripeCustomerId: customerIdFromSession(session) ?? undefined,
        status: ShopperSubStatus.ACTIVE,
        ...membershipActivateFields(row),
      },
    });
    if (params.sendWelcome !== false) await sendWelcome(shopperSubId);
    return true;
  }

  if (session.mode !== "subscription") return false;
  const subscriptionId = subscriptionIdFromSession(session);
  if (!subscriptionId) return false;

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
      ...membershipActivateFields(row),
    },
  });
  await syncShopperSubscriptionFromStripe(subscription);

  const cancelAtRaw =
    session.metadata?.cancelAtUnix ??
    subscription.metadata?.cancelAtUnix;
  const cancelAtUnix = cancelAtRaw ? Number.parseInt(cancelAtRaw, 10) : NaN;
  if (Number.isFinite(cancelAtUnix) && cancelAtUnix > 0) {
    try {
      const { applyMembershipCancelAt } = await import(
        "@/lib/membership-subscription-stripe"
      );
      await applyMembershipCancelAt({
        stripeAccountId,
        stripeSubscriptionId: subscriptionId,
        cancelAtUnix,
      });
    } catch (error) {
      console.error("Could not set membership cancel_at", error);
    }
  }

  if (params.sendWelcome !== false) await sendWelcome(shopperSubId);
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
      (s.mode === "subscription" || s.mode === "payment") &&
      s.metadata?.shopperSubscriptionId === params.shopperSubscriptionId,
  );
  if (!match) return false;
  return activateShopperSubscriptionFromCheckout({
    session: match,
    stripeAccountId: params.stripeAccountId,
  });
}
