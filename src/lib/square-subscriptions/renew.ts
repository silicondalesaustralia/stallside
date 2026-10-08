import {
  OnlinePaymentProvider,
  type Prisma,
  ShopperSubStatus,
  SubscriptionOfferKind,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { SquareApiError } from "@/lib/square/client";
import { getValidSquareAccessToken } from "@/lib/square/connection";
import { createSquarePayment } from "@/lib/square/payments";
import { squareRenewalRail } from "@/lib/square-subscriptions/rail";
import { recordSquareSubscriptionFailure } from "@/lib/square-subscriptions/record-failure";
import {
  recordSquareSubscriptionPayment,
  squareSubscriptionFeeCents,
} from "@/lib/square-subscriptions/record-payment";
import { billingCadence, nextBillingAfter } from "@/lib/square-subscriptions/schedule";

export type RenewalOutcome = "paid" | "retry" | "cancelled" | "skipped" | "deferred" | "idle";

const LOCK_MS = 10 * 60_000;
const DAY_MS = 24 * 60 * 60_000;

const ymd = (d: Date) => d.toISOString().slice(0, 10).replaceAll("-", "");

/** Card problems the shopper must fix; anything else (outage, auth) is retried without counting. */
const isCardDecline = (error: unknown) =>
  error instanceof SquareApiError && (error.status === 400 || error.status === 402);

/** Charge one due Square subscription for its current period. */
export async function renewSquareSubscription(id: string, now: Date): Promise<RenewalOutcome> {
  const claimed = await prisma.shopperSubscription.updateMany({
    where: { id, OR: [{ billingLockedUntil: null }, { billingLockedUntil: { lt: now } }] },
    data: { billingLockedUntil: new Date(now.getTime() + LOCK_MS) },
  });
  if (claimed.count === 0) return "idle";
  const release = (data: Prisma.ShopperSubscriptionUpdateInput = {}) =>
    prisma.shopperSubscription.update({ where: { id }, data: { ...data, billingLockedUntil: null } });

  const sub = await prisma.shopperSubscription.findUnique({
    where: { id },
    include: { offer: true, stand: { select: { name: true, slug: true } }, owner: true },
  });
  const due =
    sub?.paymentProvider === OnlinePaymentProvider.SQUARE &&
    (sub.status === ShopperSubStatus.ACTIVE || sub.status === ShopperSubStatus.PAST_DUE) &&
    sub.nextBillingAt != null &&
    sub.nextBillingAt <= now &&
    (sub.billingRetryAt == null || sub.billingRetryAt <= now);
  if (!sub || !due || !sub.nextBillingAt) {
    await release();
    return "idle";
  }

  const periodStart = sub.nextBillingAt;
  const isMembership = sub.offer.kind === SubscriptionOfferKind.MEMBERSHIP;
  if (sub.cancelAtPeriodEnd) {
    await release({
      status: ShopperSubStatus.CANCELLED,
      nextBillingAt: null,
      billingRetryAt: null,
      nextCollectionAt: null,
    });
    return "cancelled";
  }
  if (sub.skipNextCycle && !isMembership) {
    const cadence = billingCadence({ isMembership, interval: sub.offer.interval, billingPlan: sub.billingPlan });
    const next = nextBillingAfter(periodStart, cadence, sub.termEndsAt);
    await release({
      status: ShopperSubStatus.ACTIVE,
      skipNextCycle: false,
      nextBillingAt: next,
      currentPeriodEndsAt: next,
      billingFailures: 0,
      billingRetryAt: null,
    });
    return "skipped";
  }

  const amountCents = sub.recurringPriceCents;
  const currency = sub.offer.currency;
  if (amountCents == null) {
    console.error("Square subscription has no recurring price", id);
    await release({ nextBillingAt: null });
    return "idle";
  }
  const fail = (reason: string) =>
    recordSquareSubscriptionFailure({ sub, periodStart, amountCents, currency, reason, now });
  if (!sub.squareCardId || !sub.squareCustomerId) return fail("No saved card");

  const rail = await squareRenewalRail(sub.ownerId);
  const token = rail ? await getValidSquareAccessToken(rail.connectionId) : null;
  if (!rail || !token) {
    console.warn("Square renewal deferred: seller connection unavailable", id);
    await release({
      status: ShopperSubStatus.PAST_DUE,
      billingRetryAt: new Date(now.getTime() + DAY_MS),
    });
    return "deferred";
  }

  const appFeeCents = squareSubscriptionFeeCents(sub.owner, amountCents, currency);
  try {
    const res = await createSquarePayment({
      accessToken: token,
      sourceId: sub.squareCardId,
      customerId: sub.squareCustomerId,
      customerInitiated: false,
      amountCents,
      currency,
      locationId: rail.locationId,
      idempotencyKey: `vsr-${sub.id}-${ymd(periodStart)}-${sub.billingFailures}`,
      appFeeCents,
      referenceId: sub.id,
      note: `Vendl subscription: ${sub.offer.title}`,
      buyerEmail: sub.customerEmail,
    });
    if (res.payment?.id && res.payment.status === "COMPLETED") {
      await recordSquareSubscriptionPayment({
        shopperSubscriptionId: sub.id,
        periodStart,
        amountCents,
        appFeeCents: res.payment.app_fee_money?.amount ?? 0,
        currency,
        squarePaymentId: res.payment.id,
      });
      return "paid";
    }
    return fail(`Payment ${res.payment?.status ?? "not completed"}`);
  } catch (error) {
    if (isCardDecline(error)) return fail(error instanceof Error ? error.message : "Card declined");
    console.error("Square renewal error; will retry next run", id, error);
    await release();
    return "deferred";
  }
}
