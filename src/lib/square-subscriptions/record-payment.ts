import { ShopperSubStatus, SubscriptionOfferKind } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { computeVendlCheckoutFees } from "@/lib/stallside-fee";
import { createSubscriptionCycleOrder } from "@/lib/subscription-cycle-order";
import { billingCadence, nextBillingAfter } from "@/lib/square-subscriptions/schedule";

type FeeOwner = Parameters<typeof computeVendlCheckoutFees>[1];

/** Vendl's fee on one Square subscription charge (none on Pro; AUD never passes it on). */
export function squareSubscriptionFeeCents(
  owner: FeeOwner,
  amountCents: number,
  currency: string,
): number {
  return computeVendlCheckoutFees(amountCents, owner, { rail: "square", currency })
    .applicationFeeCents;
}

/** Record a successful charge and move the subscription to its next period. Idempotent on payment id. */
export async function recordSquareSubscriptionPayment(input: {
  shopperSubscriptionId: string;
  periodStart: Date;
  amountCents: number;
  appFeeCents: number;
  currency: string;
  squarePaymentId: string;
}): Promise<void> {
  const seen = await prisma.shopperSubscriptionCharge.findUnique({
    where: { squarePaymentId: input.squarePaymentId },
    select: { id: true },
  });
  if (seen) return;

  const sub = await prisma.shopperSubscription.findUnique({
    where: { id: input.shopperSubscriptionId },
    include: { offer: { select: { kind: true, interval: true } } },
  });
  if (!sub) return;

  const isMembership = sub.offer.kind === SubscriptionOfferKind.MEMBERSHIP;
  const cadence = billingCadence({
    isMembership,
    interval: sub.offer.interval,
    billingPlan: sub.billingPlan,
  });
  const next = nextBillingAfter(input.periodStart, cadence, sub.termEndsAt);
  const now = new Date();
  const membershipFinished = isMembership && !next && sub.collectionsRemaining === 0;

  await prisma.$transaction([
    prisma.shopperSubscriptionCharge.create({
      data: {
        shopperSubscriptionId: sub.id,
        ownerId: sub.ownerId,
        periodStart: input.periodStart,
        amountCents: input.amountCents,
        appFeeCents: input.appFeeCents,
        currency: input.currency,
        status: "PAID",
        squarePaymentId: input.squarePaymentId,
      },
    }),
    prisma.shopperSubscription.update({
      where: { id: sub.id },
      data: {
        status:
          sub.status === ShopperSubStatus.CANCELLED || membershipFinished
            ? ShopperSubStatus.CANCELLED
            : ShopperSubStatus.ACTIVE,
        lastPaymentAt: now,
        nextBillingAt: next,
        billingFailures: 0,
        billingRetryAt: null,
        billingLockedUntil: null,
        ...(isMembership
          ? { paidThroughAt: next ?? sub.termEndsAt }
          : { currentPeriodEndsAt: next }),
      },
    }),
  ]);

  if (!isMembership) {
    await createSubscriptionCycleOrder(sub.id, {
      rail: "square",
      squarePaymentId: input.squarePaymentId,
      platformFeeCents: input.appFeeCents,
    });
  }
}
