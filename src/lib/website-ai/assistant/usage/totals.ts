import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type UsageTotals = {
  calls: number;
  inputTokens: number;
  outputTokens: number;
  images: number;
  costUsdMicros: number;
  unknownCostCalls: number;
};

export function monthStart(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/** Sums usage events; calls with no configured price add nothing to cost and are counted separately. */
export async function usageTotals(where: Prisma.AiUsageEventWhereInput): Promise<UsageTotals> {
  const [agg, unknownCostCalls] = await Promise.all([
    prisma.aiUsageEvent.aggregate({
      where,
      _count: { _all: true },
      _sum: { inputTokens: true, outputTokens: true, images: true, costUsdMicros: true },
    }),
    prisma.aiUsageEvent.count({ where: { ...where, costUsdMicros: null } }),
  ]);
  return {
    calls: agg._count._all,
    inputTokens: agg._sum.inputTokens ?? 0,
    outputTokens: agg._sum.outputTokens ?? 0,
    images: agg._sum.images ?? 0,
    costUsdMicros: agg._sum.costUsdMicros ?? 0,
    unknownCostCalls,
  };
}
