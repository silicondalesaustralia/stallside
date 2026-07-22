import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@/generated/prisma/client";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import { demoStandSlugs } from "@/lib/demo";
import { COUNTED_STATUSES } from "@/lib/order-metrics";

const LIVE: SubscriptionStatus[] = [
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.TRIALING,
];

export async function getSaasStats() {
  const demoSlugs = [...demoStandSlugs()];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [owners, byStatus, liveOwners, demoCompletions, demoCompletions7d] =
    await Promise.all([
      prisma.owner.count(),
      prisma.owner.groupBy({
        by: ["subscriptionStatus"],
        _count: { _all: true },
      }),
      prisma.owner.findMany({
        where: { subscriptionStatus: { in: LIVE } },
        select: { monthlyFeeCents: true, lifetimePaidCents: true },
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
    ]);

  const statusCounts = Object.fromEntries(
    byStatus.map((row) => [row.subscriptionStatus, row._count._all]),
  ) as Partial<Record<SubscriptionStatus, number>>;

  const mrrCents = liveOwners.reduce((sum, o) => sum + o.monthlyFeeCents, 0);
  const allLtv = await prisma.owner.aggregate({
    _sum: { lifetimePaidCents: true },
  });

  return {
    owners,
    currency: DEFAULT_CURRENCY,
    mrrCents,
    totalLtvCents: allLtv._sum.lifetimePaidCents ?? 0,
    liveSubscribers: liveOwners.length,
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
