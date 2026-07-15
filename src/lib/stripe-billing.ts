import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@/generated/prisma/client";
import { cashPlanCents, isBillingCurrency, type BillingCurrency } from "@/lib/saas-pricing";

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
      : cashPlanCents(currency);
  return { currency, monthlyFeeCents };
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
  const { currency, monthlyFeeCents } = billingFromSubscription(subscription);

  await prisma.owner.update({
    where: { id: owner.id },
    data: {
      stripeCustomerId: customerId || owner.stripeCustomerId,
      stripeSubscriptionId: cancelled ? null : subscription.id,
      subscriptionStatus: mapStripeSubscriptionStatus(subscription.status),
      subscriptionPlan: "cash",
      monthlyFeeCents,
      billingCurrency: currency,
      ...(live && !owner.subscriptionStartedAt
        ? { subscriptionStartedAt: new Date() }
        : {}),
    },
  });
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
