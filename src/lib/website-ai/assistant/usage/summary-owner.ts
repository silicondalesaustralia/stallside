import { prisma } from "@/lib/prisma";
import { monthStart, usageTotals, type UsageTotals } from "./totals";

const SUCCESS = ["READY", "APPLIED"] as const;

export type OwnerBuildRow = {
  id: string;
  createdAt: Date;
  status: string;
  mode: string;
  model: string | null;
  tokens: number;
  images: number;
  costUsdMicros: number;
};

export type OwnerAiUsage = {
  allTime: UsageTotals;
  thisMonth: UsageTotals;
  builds: { total: number; successful: number; thisMonth: number; avgCostUsdMicros: number | null };
  recent: OwnerBuildRow[];
};

export async function ownerAiUsage(ownerId: string): Promise<OwnerAiUsage> {
  const since = monthStart();
  const [allTime, thisMonth, total, successful, monthBuilds, avg, recent] = await Promise.all([
    usageTotals({ ownerId }),
    usageTotals({ ownerId, createdAt: { gte: since } }),
    prisma.websiteGenerationJob.count({ where: { ownerId } }),
    prisma.websiteGenerationJob.count({ where: { ownerId, status: { in: [...SUCCESS] } } }),
    prisma.websiteGenerationJob.count({ where: { ownerId, createdAt: { gte: since } } }),
    prisma.websiteGenerationJob.aggregate({
      where: { ownerId, status: { in: [...SUCCESS] }, costUsdMicros: { gt: 0 } },
      _avg: { costUsdMicros: true },
    }),
    prisma.websiteGenerationJob.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true, createdAt: true, status: true, mode: true, modelUsed: true,
        inputTokens: true, outputTokens: true, imageCount: true, costUsdMicros: true,
      },
    }),
  ]);
  return {
    allTime,
    thisMonth,
    builds: {
      total,
      successful,
      thisMonth: monthBuilds,
      avgCostUsdMicros: avg._avg.costUsdMicros === null ? null : Math.round(avg._avg.costUsdMicros),
    },
    recent: recent.map((j) => ({
      id: j.id,
      createdAt: j.createdAt,
      status: j.status,
      mode: j.mode,
      model: j.modelUsed,
      tokens: j.inputTokens + j.outputTokens,
      images: j.imageCount,
      costUsdMicros: j.costUsdMicros,
    })),
  };
}
