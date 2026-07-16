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
import { fulfillPaidCardOrder } from "@/lib/fulfill-paid-order";
import { syncStripeAccountStatus } from "@/lib/stripe-sync";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@/generated/prisma/client";

export const runtime = "nodejs";

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  livemode: boolean,
) {
  if (session.mode === "subscription") {
    // Demo uses test payment Checkout only — ignore test SaaS events.
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

  const orderId = session.metadata?.orderId;
  if (orderId && session.payment_status === "paid") {
    const paymentIntent =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    await fulfillPaidCardOrder(orderId, paymentIntent);
  }
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

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
        event.livemode,
      );
    }

    if (event.type === "checkout.session.async_payment_succeeded") {
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
        event.livemode,
      );
    }

    if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await prisma.order.updateMany({
          where: { id: orderId, paymentStatus: PaymentStatus.PENDING },
          data: { paymentStatus: PaymentStatus.EXPIRED },
        });
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await prisma.order.updateMany({
          where: { id: orderId, paymentStatus: PaymentStatus.PENDING },
          data: { paymentStatus: PaymentStatus.EXPIRED },
        });
      }
    }

    if (event.type === "account.updated") {
      await handleConnectAccountUpdated(event.data.object as Stripe.Account);
    }

    if (
      event.livemode &&
      (event.type === "customer.subscription.updated" ||
        event.type === "customer.subscription.deleted")
    ) {
      await syncOwnerFromSubscription(
        event.data.object as Stripe.Subscription,
      );
    }

    if (event.livemode && event.type === "invoice.paid") {
      await recordSubscriptionInvoicePaid(
        event.data.object as Stripe.Invoice,
      );
    }
  } catch (error) {
    console.error("Stripe webhook handler failed", error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
