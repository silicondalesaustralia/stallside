import type Stripe from "stripe";
import { ShopperSubStatus } from "@/generated/prisma/client";
import { getStripe } from "@/lib/stripe";
import { syncShopperSubscriptionFromStripe } from "@/lib/shopper-subscription-sync";
import { fulfillShopperSubscriptionInvoice } from "@/lib/fulfill-shopper-subscription";
import { activateShopperSubscriptionFromCheckout } from "@/lib/shopper-subscription-activate";
import { prisma } from "@/lib/prisma";
import { subscriptionIdFromInvoice } from "@/lib/stripe-invoice-ids";

function isShopperPurpose(meta: Stripe.Metadata | null | undefined): boolean {
  return meta?.purpose === "shopper_subscription";
}

export async function handleShopperCheckoutCompleted(
  session: Stripe.Checkout.Session,
  connectedAccountId: string | undefined,
) {
  if (session.mode !== "subscription") return false;
  if (!isShopperPurpose(session.metadata)) return false;

  const stripeAccountId =
    connectedAccountId ||
    session.metadata?.stripeAccountId ||
    undefined;
  if (!stripeAccountId) {
    const shopperSubId = session.metadata?.shopperSubscriptionId;
    if (shopperSubId) {
      const row = await prisma.shopperSubscription.findUnique({
        where: { id: shopperSubId },
        include: { owner: { select: { stripeAccountId: true } } },
      });
      if (row?.owner.stripeAccountId) {
        await activateShopperSubscriptionFromCheckout({
          session,
          stripeAccountId: row.owner.stripeAccountId,
        });
        return true;
      }
    }
    console.error(
      "Shopper checkout completed without Connect account id",
      session.id,
    );
    return true;
  }

  await activateShopperSubscriptionFromCheckout({
    session,
    stripeAccountId,
  });
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
  const metaSubId =
    invoice.metadata?.shopperSubscriptionId ??
    invoice.parent?.subscription_details?.metadata?.shopperSubscriptionId;

  if (purpose === "shopper_subscription" || metaSubId) {
    // Ensure stripeSubscriptionId is linked before fulfill (missed checkout webhook).
    if (metaSubId && typeof metaSubId === "string") {
      const subId = subscriptionIdFromInvoice(invoice);
      if (subId) {
        await prisma.shopperSubscription.updateMany({
          where: { id: metaSubId },
          data: {
            stripeSubscriptionId: subId,
            status: ShopperSubStatus.ACTIVE,
          },
        });
      }
    }
    await fulfillShopperSubscriptionInvoice(invoice);
    return true;
  }

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
  const subId = subscriptionIdFromInvoice(invoice);
  if (!subId) return false;
  const updated = await prisma.shopperSubscription.updateMany({
    where: { stripeSubscriptionId: subId },
    data: { status: ShopperSubStatus.PAST_DUE },
  });
  return updated.count > 0;
}

/** Success-page fallback when webhook is delayed. */
export async function syncShopperSubFromSuccessSession(params: {
  shopperSubscriptionId: string;
  checkoutSessionId?: string;
}) {
  const row = await prisma.shopperSubscription.findUnique({
    where: { id: params.shopperSubscriptionId },
    include: { owner: { select: { stripeAccountId: true } } },
  });
  if (!row?.owner.stripeAccountId) return false;
  if (row.status === ShopperSubStatus.ACTIVE && row.stripeSubscriptionId) {
    return true;
  }

  const stripe = getStripe();
  const acct = row.owner.stripeAccountId;
  if (params.checkoutSessionId) {
    const session = await stripe.checkout.sessions.retrieve(
      params.checkoutSessionId,
      {},
      { stripeAccount: acct },
    );
    return activateShopperSubscriptionFromCheckout({
      session,
      stripeAccountId: acct,
    });
  }

  const { healIncompleteShopperSubscription } = await import(
    "@/lib/shopper-subscription-activate"
  );
  return healIncompleteShopperSubscription({
    shopperSubscriptionId: params.shopperSubscriptionId,
    stripeAccountId: acct,
  });
}
