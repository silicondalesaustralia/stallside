import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@/generated/prisma/client";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import { demoStandSlugs } from "@/lib/demo";
import { COUNTED_STATUSES } from "@/lib/order-metrics";
import { audRatesFromMarket, billingCentsToAud } from "@/lib/fx-to-aud";

/** Statuses that still bill (exclude trials / comps). */
const BILLING_LIVE: SubscriptionStatus[] = [
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.PAST_DUE,
];

/** Paying SaaS subscribers only - not Free-for-Life, app trials, or leftover fee rows. */
const paidSubscriberWhere = {
  lifetimeAccess: false,
  stripeSubscriptionId: { not: null },
  monthlyFeeCents: { gt: 0 },
  subscriptionStatus: { in: BILLING_LIVE },
} as const;

export async function getSaasStats() {
  const demoSlugs = [...demoStandSlugs()];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    owners,
    byStatus,
    paidSubscribers,
    ltvOwners,
    demoCompletions,
    demoCompletions7d,
    fx,
  ] = await Promise.all([
    prisma.owner.count(),
    prisma.owner.groupBy({
      by: ["subscriptionStatus"],
      _count: { _all: true },
    }),
    prisma.owner.findMany({
      where: paidSubscriberWhere,
      select: { monthlyFeeCents: true, billingCurrency: true },
    }),
    prisma.owner.findMany({
      where: { lifetimePaidCents: { gt: 0 } },
      select: { lifetimePaidCents: true, billingCurrency: true },
    }),
    demoSlugs.length
      ? prisma.order.count({
          where: {
            paymentStatus: { in: COUNTED_STATUSES },
            stand: { slug: { in: demoSlugs } },
          },
        })
      : Promise.resolve(0),
    demoSlugs.length
      ? prisma.order.count({
          where: {
            paymentStatus: { in: COUNTED_STATUSES },
            stand: { slug: { in: demoSlugs } },
            createdAt: { gte: weekAgo },
          },
        })
      : Promise.resolve(0),
    audRatesFromMarket(),
  ]);

  const statusCounts = Object.fromEntries(
    byStatus.map((row) => [row.subscriptionStatus, row._count._all]),
  ) as Partial<Record<SubscriptionStatus, number>>;

  const mrrCents = paidSubscribers.reduce(
    (sum, o) =>
      sum + billingCentsToAud(o.monthlyFeeCents, o.billingCurrency, fx),
    0,
  );
  const totalLtvCents = ltvOwners.reduce(
    (sum, o) =>
      sum + billingCentsToAud(o.lifetimePaidCents, o.billingCurrency, fx),
    0,
  );

  return {
    owners,
    currency: DEFAULT_CURRENCY,
    mrrCents,
    totalLtvCents,
    liveSubscribers: paidSubscribers.length,
    active: statusCounts.ACTIVE ?? 0,
    trialing: statusCounts.TRIALING ?? 0,
    pastDue: statusCounts.PAST_DUE ?? 0,
    cancelled: statusCounts.CANCELLED ?? 0,
    none: statusCounts.NONE ?? 0,
    demoCompletions,
    demoCompletions7d,
    demoStandCount: demoSlugs.length,
  };
}
