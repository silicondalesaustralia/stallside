import type Stripe from "stripe";
import {
  ShopperSubStatus,
  type ShopperSubStatus as Status,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { nextCollectionAt } from "@/lib/subscription-offer";
import { expandableId } from "@/lib/stripe-invoice-ids";

function mapStripeStatus(
  status: Stripe.Subscription.Status,
  paused: boolean,
): Status {
  if (paused) return ShopperSubStatus.PAUSED;
  switch (status) {
    case "active":
    case "trialing":
      return ShopperSubStatus.ACTIVE;
    case "past_due":
    case "unpaid":
      return ShopperSubStatus.PAST_DUE;
    case "canceled":
    case "incomplete_expired":
      return ShopperSubStatus.CANCELLED;
    case "incomplete":
    case "paused":
      return status === "paused"
        ? ShopperSubStatus.PAUSED
        : ShopperSubStatus.INCOMPLETE;
    default:
      return ShopperSubStatus.INCOMPLETE;
  }
}

function periodEnd(subscription: Stripe.Subscription): Date | null {
  const end = subscription.items.data[0]?.current_period_end;
  if (!end) return null;
  return new Date(end * 1000);
}

/** Sync ShopperSubscription from a Connect Stripe Subscription object. */
export async function syncShopperSubscriptionFromStripe(
  subscription: Stripe.Subscription,
) {
  const purpose = subscription.metadata?.purpose;
  if (purpose !== "shopper_subscription") return;

  const shopperSubId = subscription.metadata?.shopperSubscriptionId;
  const row = shopperSubId
    ? await prisma.shopperSubscription.findUnique({
        where: { id: shopperSubId },
        include: { offer: true },
      })
    : await prisma.shopperSubscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
        include: { offer: true },
      });
  if (!row) return;

  const paused = Boolean(subscription.pause_collection);
  const status = mapStripeStatus(subscription.status, paused);
  const ends = periodEnd(subscription);
  const customerId = expandableId(subscription.customer);

  await prisma.shopperSubscription.update({
    where: { id: row.id },
    data: {
      status,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId ?? row.stripeCustomerId,
      cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
      currentPeriodEndsAt: ends,
      pausedAt:
        status === ShopperSubStatus.PAUSED
          ? (row.pausedAt ?? new Date())
          : null,
      nextCollectionAt: ends
        ? nextCollectionAt({
            from: ends,
            weekday: row.offer.collectionWeekday,
            interval: row.offer.interval,
          })
        : row.nextCollectionAt,
    },
  });
}
