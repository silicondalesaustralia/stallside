import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { stripeClientForLivemode } from "@/lib/stripe-demo";
import {
  constructStripeWebhookEvent,
  stripeWebhookSecrets,
} from "@/lib/stripe-webhook";
import {
  recordSubscriptionInvoicePaid,
  syncOwnerFromSubscription,
} from "@/lib/stripe-billing";
import {
  completePaidCardCheckout,
  expirePendingCardOrder,
} from "@/lib/stripe-card-checkout";
import { syncStripeAccountStatus } from "@/lib/stripe-sync";
import { maybeSendStripeRestrictedNudge } from "@/lib/lifecycle-emails/send-stripe-nudges";
import { prisma } from "@/lib/prisma";
import {
  handleShopperCheckoutCompleted,
  handleShopperInvoiceFailed,
  handleShopperInvoicePaid,
  handleShopperSubscriptionEvent,
} from "@/lib/shopper-subscription-webhook";

export const runtime = "nodejs";

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  livemode: boolean,
  connectedAccountId: string | undefined,
) {
  if (session.mode === "subscription") {
    const shopper = await handleShopperCheckoutCompleted(
      session,
      connectedAccountId,
    );
    if (shopper) return;
    if (!livemode) return;
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;
    if (!subscriptionId) return;
    const stripe = stripeClientForLivemode(true) ?? getStripe();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await syncOwnerFromSubscription(subscription);
    return;
  }

  await completePaidCardCheckout(session, livemode, connectedAccountId);
}

async function handleConnectAccountUpdated(account: Stripe.Account) {
  const owner = await prisma.owner.findFirst({
    where: { stripeAccountId: account.id },
    select: { id: true },
  });
  if (!owner) return;
  await syncStripeAccountStatus({
    ownerId: owner.id,
    stripeAccountId: account.id,
  });
  await maybeSendStripeRestrictedNudge(owner.id);
}

export async function POST(req: NextRequest) {
  if (stripeWebhookSecrets().length === 0) {
    return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = constructStripeWebhookEvent(body, signature);
  } catch (error) {
    console.error("Stripe webhook signature failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const connectedAccountId =
    typeof event.account === "string" ? event.account : undefined;

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
        event.livemode,
        connectedAccountId,
      );
    }

    if (event.type === "checkout.session.async_payment_succeeded") {
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
        event.livemode,
        connectedAccountId,
      );
    }

    if (
      event.type === "checkout.session.async_payment_failed" ||
      event.type === "checkout.session.expired"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      await expirePendingCardOrder(session.metadata?.orderId);
    }

    if (event.type === "account.updated") {
      await handleConnectAccountUpdated(event.data.object as Stripe.Account);
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object as Stripe.Subscription;
      const shopper = await handleShopperSubscriptionEvent(sub);
      if (!shopper && event.livemode && !connectedAccountId) {
        await syncOwnerFromSubscription(sub);
      }
    }

    if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;
      const shopper = await handleShopperInvoicePaid(invoice);
      if (!shopper && event.livemode && !connectedAccountId) {
        await recordSubscriptionInvoicePaid(invoice);
      }
    }

    if (event.type === "invoice.payment_failed") {
      await handleShopperInvoiceFailed(
        event.data.object as Stripe.Invoice,
      );
    }
  } catch (error) {
    console.error("Stripe webhook handler failed", error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
