import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@/generated/prisma/client";
import {
  cardPlanCents,
  isBillingCurrency,
  type BillingCurrency,
} from "@/lib/saas-pricing";
import { saasPlanFromSubscription } from "@/lib/stripe";
import { ensureStandsHaveStarterPaymentMethod } from "@/lib/ensure-stand-payment-fallback";

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): SubscriptionStatus {
  switch (status) {
    case "trialing":
      return SubscriptionStatus.TRIALING;
    case "active":
      return SubscriptionStatus.ACTIVE;
    case "past_due":
    case "unpaid":
      return SubscriptionStatus.PAST_DUE;
    case "canceled":
    case "incomplete_expired":
      return SubscriptionStatus.CANCELLED;
    default:
      return SubscriptionStatus.NONE;
  }
}

function billingFromSubscription(subscription: Stripe.Subscription): {
  currency: BillingCurrency;
  monthlyFeeCents: number;
} {
  const item = subscription.items.data[0];
  const raw = (item?.price.currency ?? "aud").toUpperCase();
  const currency: BillingCurrency = isBillingCurrency(raw) ? raw : "AUD";
  const monthlyFeeCents =
    typeof item?.price.unit_amount === "number"
      ? item.price.unit_amount
      : cardPlanCents(currency);
  return { currency, monthlyFeeCents };
}

function periodEndFromSubscription(subscription: Stripe.Subscription): Date | null {
  if (subscription.cancel_at) {
    return new Date(subscription.cancel_at * 1000);
  }
  const itemEnd = subscription.items.data[0]?.current_period_end;
  if (typeof itemEnd === "number") {
    return new Date(itemEnd * 1000);
  }
  return null;
}

export async function syncOwnerFromSubscription(
  subscription: Stripe.Subscription,
) {
  const ownerId = subscription.metadata.ownerId;
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  let owner = ownerId
    ? await prisma.owner.findUnique({ where: { id: ownerId } })
    : null;

  if (!owner && customerId) {
    owner = await prisma.owner.findFirst({
      where: { stripeCustomerId: customerId },
    });
  }

  if (!owner) {
    console.error("Stripe subscription sync: owner not found", subscription.id);
    return;
  }

  const cancelled =
    subscription.status === "canceled" ||
    subscription.status === "incomplete_expired";
  const live =
    subscription.status === "active" || subscription.status === "trialing";
  const newlySchedulingCancel =
    !cancelled &&
    Boolean(subscription.cancel_at_period_end) &&
    !owner.cancelAtPeriodEnd;
  const { currency, monthlyFeeCents } = billingFromSubscription(subscription);
  const periodEnd = periodEndFromSubscription(subscription);
  const plan = saasPlanFromSubscription(subscription);
  const isPro = plan === "pro";
  const feeFallback = isPro ? cardPlanCents(currency) : 0;

  // Fully cancelled with no remaining period → Starter.
  const downgradeToStarter =
    cancelled &&
    !(periodEnd != null && periodEnd.getTime() > Date.now());

  const now = new Date();

  await prisma.owner.update({
    where: { id: owner.id },
    data: {
      stripeCustomerId: customerId || owner.stripeCustomerId,
      stripeSubscriptionId: cancelled ? null : subscription.id,
      subscriptionStatus: mapStripeSubscriptionStatus(subscription.status),
      subscriptionPlan: downgradeToStarter
        ? "starter"
        : isPro
          ? "pro"
          : "starter",
      monthlyFeeCents: downgradeToStarter
        ? 0
        : monthlyFeeCents || feeFallback,
      billingCurrency: currency,
      cancelAtPeriodEnd: cancelled
        ? false
        : Boolean(subscription.cancel_at_period_end),
      currentPeriodEndsAt: periodEnd,
      ...(live && isPro
        ? {
            trialEndsAt: null,
            proLapsedAt: null,
            proLapseDay0SentAt: null,
            proLapseDay23SentAt: null,
            proLapseDay45SentAt: null,
          }
        : {}),
      ...(live && !owner.subscriptionStartedAt
        ? { subscriptionStartedAt: now }
        : {}),
      ...(downgradeToStarter
        ? { proLapsedAt: owner.proLapsedAt ?? now }
        : {}),
    },
  });

  if (live && !cancelled && isPro) {
    const { sendAndMarkCardWelcome } = await import(
      "@/lib/lifecycle-emails/send-and-mark"
    );
    await sendAndMarkCardWelcome(owner.id);
  }

  if (downgradeToStarter) {
    const { sendAndMarkProLapseDay0 } = await import(
      "@/lib/lifecycle-emails/send-and-mark"
    );
    await sendAndMarkProLapseDay0(owner.id);
    await ensureStandsHaveStarterPaymentMethod(owner.id);
  } else if (cancelled || newlySchedulingCancel) {
    // Still has Pro until period end (or cancelled without downgrade yet).
    const { sendAndMarkCancelFeedback } = await import(
      "@/lib/lifecycle-emails/send-and-mark"
    );
    await sendAndMarkCancelFeedback(owner.id);
  }
}

function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const details = invoice.parent?.subscription_details;
  if (!details?.subscription) return null;
  return typeof details.subscription === "string"
    ? details.subscription
    : details.subscription.id;
}

/** Count SaaS invoice payments toward owner LTV. */
export async function recordSubscriptionInvoicePaid(invoice: Stripe.Invoice) {
  if (invoice.amount_paid <= 0) return;

  const subscriptionId = subscriptionIdFromInvoice(invoice);
  if (!subscriptionId) return;

  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;
  if (!customerId) return;

  const owner = await prisma.owner.findFirst({
    where: {
      OR: [
        { stripeCustomerId: customerId },
        { stripeSubscriptionId: subscriptionId },
      ],
    },
  });
  if (!owner) return;

  await prisma.owner.update({
    where: { id: owner.id },
    data: {
      lifetimePaidCents: { increment: invoice.amount_paid },
      subscriptionStartedAt: owner.subscriptionStartedAt ?? new Date(),
    },
  });
}
