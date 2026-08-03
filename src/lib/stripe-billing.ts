import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { cardPlanCents } from "@/lib/saas-pricing";
import { saasPlanFromSubscription } from "@/lib/stripe";
import {
  adminKindForSubscriptionSync,
  notifyAdminAfterSubscriptionSync,
  sendCustomerSubscriptionEmails,
} from "@/lib/stripe-billing-effects";
import {
  billingFromSubscription,
  mapStripeSubscriptionStatus,
  periodEndFromSubscription,
} from "@/lib/stripe-billing-map";

export { mapStripeSubscriptionStatus } from "@/lib/stripe-billing-map";
export { recordSubscriptionInvoicePaid } from "@/lib/stripe-billing-invoice";

export async function syncOwnerFromSubscription(
  subscription: Stripe.Subscription,
) {
  const ownerId = subscription.metadata.ownerId;
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const ownerInclude = {
    user: { select: { email: true, name: true } },
  } as const;

  let owner = ownerId
    ? await prisma.owner.findUnique({
        where: { id: ownerId },
        include: ownerInclude,
      })
    : null;

  if (!owner && customerId) {
    owner = await prisma.owner.findFirst({
      where: { stripeCustomerId: customerId },
      include: ownerInclude,
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
  const cancelAtPeriodEnd = Boolean(subscription.cancel_at_period_end);
  const newlySchedulingCancel =
    !cancelled && cancelAtPeriodEnd && !owner.cancelAtPeriodEnd;
  const { currency, monthlyFeeCents } = billingFromSubscription(subscription);
  const periodEnd = periodEndFromSubscription(subscription);
  const isPro = saasPlanFromSubscription(subscription) === "pro";
  const feeFallback = isPro ? cardPlanCents(currency) : 0;
  const downgradeToStarter =
    cancelled &&
    !(periodEnd != null && periodEnd.getTime() > Date.now());
  const planAfter = downgradeToStarter ? "free" : isPro ? "pro" : "free";
  const feeAfter = downgradeToStarter ? 0 : monthlyFeeCents || feeFallback;
  const statusAfter = mapStripeSubscriptionStatus(subscription.status);
  const storedCancelAtPeriodEnd = cancelled ? false : cancelAtPeriodEnd;
  const adminKind = adminKindForSubscriptionSync({
    owner,
    live,
    isPro,
    cancelled,
    newlySchedulingCancel,
    downgradeToStarter,
    cancelAtPeriodEnd: storedCancelAtPeriodEnd,
  });
  const now = new Date();

  await prisma.owner.update({
    where: { id: owner.id },
    data: {
      stripeCustomerId: customerId || owner.stripeCustomerId,
      stripeSubscriptionId: cancelled ? null : subscription.id,
      subscriptionStatus: statusAfter,
      subscriptionPlan: planAfter,
      monthlyFeeCents: feeAfter,
      billingCurrency: currency,
      cancelAtPeriodEnd: storedCancelAtPeriodEnd,
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

  if (adminKind) {
    await notifyAdminAfterSubscriptionSync({
      kind: adminKind,
      owner,
      planAfter,
      statusAfter,
      monthlyFeeCents: feeAfter,
      currency,
      periodEndsAt: periodEnd,
      stripeSubscriptionId: subscription.id,
    });
  }

  await sendCustomerSubscriptionEmails({
    ownerId: owner.id,
    live,
    cancelled,
    isPro,
    downgradeToStarter,
    newlySchedulingCancel,
  });
}
