import { prisma } from "@/lib/prisma";
import { demoStandSlugs } from "@/lib/demo";
import { COUNTED_STATUSES } from "@/lib/order-metrics";
import {
  buildSaasSeries,
  type SaasMetricKey,
  type SaasSeriesPoint,
} from "@/lib/saas-series";

/** Time-series events for the admin SaaS chart. */
export async function getSaasSeries(
  start: Date,
  end: Date,
): Promise<SaasSeriesPoint[]> {
  const demoSlugs = [...demoStandSlugs()];

  const [owners, demos, invites] = await Promise.all([
    prisma.owner.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { createdAt: true },
    }),
    demoSlugs.length
      ? prisma.order.findMany({
          where: {
            createdAt: { gte: start, lte: end },
            paymentStatus: { in: COUNTED_STATUSES },
            stand: { slug: { in: demoSlugs } },
          },
          select: { createdAt: true },
        })
      : Promise.resolve([]),
    prisma.lifetimeInviteRedemption.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { createdAt: true },
    }),
  ]);

  const events: { at: Date; metric: SaasMetricKey }[] = [
    ...owners.map((row) => ({ at: row.createdAt, metric: "owners" as const })),
    ...demos.map((row) => ({ at: row.createdAt, metric: "demos" as const })),
    ...invites.map((row) => ({ at: row.createdAt, metric: "invites" as const })),
  ];

  return buildSaasSeries(events, start, end);
}
