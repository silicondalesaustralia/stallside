import { prisma } from "@/lib/prisma";
import { monthStart, usageTotals, type UsageTotals } from "./totals";

const SUCCESS = ["READY", "APPLIED"] as const;

export type MonthRow = { month: Date; calls: number; tokens: number; costUsdMicros: number };
export type FeatureRow = { feature: string; calls: number; tokens: number; costUsdMicros: number };
export type AccountRow = { ownerId: string; name: string; calls: number; tokens: number; costUsdMicros: number };

export type PlatformAiUsage = {
  allTime: UsageTotals;
  thisMonth: UsageTotals;
  months: MonthRow[];
  features: FeatureRow[];
  accounts: AccountRow[];
  builds: { successful: number; failed: number; avgCostUsdMicros: number | null };
};

type RawMonth = { month: Date; calls: bigint; tokens: bigint | null; cost: bigint | null };

export async function platformAiUsage(): Promise<PlatformAiUsage> {
  const sixMonthsAgo = new Date(monthStart().getTime());
  sixMonthsAgo.setUTCMonth(sixMonthsAgo.getUTCMonth() - 5);
  const sumFields = { inputTokens: true, outputTokens: true, costUsdMicros: true } as const;
  const [allTime, thisMonth, months, features, accounts, successful, failed, avg] = await Promise.all([
    usageTotals({}),
    usageTotals({ createdAt: { gte: monthStart() } }),
    prisma.$queryRaw<RawMonth[]>`
      SELECT date_trunc('month', "createdAt") AS month, COUNT(*) AS calls,
             SUM("inputTokens" + "outputTokens") AS tokens, SUM("costUsdMicros") AS cost
      FROM "AiUsageEvent" WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY 1 ORDER BY 1 DESC`,
    prisma.aiUsageEvent.groupBy({ by: ["feature"], _count: { _all: true }, _sum: sumFields }),
    prisma.aiUsageEvent.groupBy({
      by: ["ownerId"],
      _count: { _all: true },
      _sum: sumFields,
      orderBy: { _sum: { costUsdMicros: "desc" } },
      take: 20,
    }),
    prisma.websiteGenerationJob.count({ where: { status: { in: [...SUCCESS] } } }),
    prisma.websiteGenerationJob.count({ where: { status: "FAILED" } }),
    prisma.websiteGenerationJob.aggregate({
      where: { status: { in: [...SUCCESS] }, costUsdMicros: { gt: 0 } },
      _avg: { costUsdMicros: true },
    }),
  ]);
  const owners = await prisma.owner.findMany({
    where: { id: { in: accounts.map((a) => a.ownerId) } },
    select: { id: true, businessName: true },
  });
  const names = new Map(owners.map((o) => [o.id, o.businessName]));
  return {
    allTime,
    thisMonth,
    months: months.map((m) => ({ month: m.month, calls: Number(m.calls), tokens: Number(m.tokens ?? 0), costUsdMicros: Number(m.cost ?? 0) })),
    features: features
      .map((f) => ({ feature: f.feature, calls: f._count._all, tokens: (f._sum.inputTokens ?? 0) + (f._sum.outputTokens ?? 0), costUsdMicros: f._sum.costUsdMicros ?? 0 }))
      .sort((a, b) => b.costUsdMicros - a.costUsdMicros),
    accounts: accounts.map((a) => ({
      ownerId: a.ownerId,
      name: names.get(a.ownerId) ?? "Deleted account",
      calls: a._count._all,
      tokens: (a._sum.inputTokens ?? 0) + (a._sum.outputTokens ?? 0),
      costUsdMicros: a._sum.costUsdMicros ?? 0,
    })),
    builds: { successful, failed, avgCostUsdMicros: avg._avg.costUsdMicros === null ? null : Math.round(avg._avg.costUsdMicros) },
  };
}
