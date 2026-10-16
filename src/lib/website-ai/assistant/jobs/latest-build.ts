import { prisma } from "@/lib/prisma";

export type LatestBuild = "building" | "confirm" | "ready" | "failed" | null;

const RECENT_MS = 24 * 60 * 60 * 1000;

/** Status of the owner's most recent assistant build, for the Web Studio entry card. */
export async function latestBuildState(ownerId: string, storefrontId: string): Promise<LatestBuild> {
  const job = await prisma.websiteGenerationJob.findFirst({
    where: { ownerId, storefrontId },
    orderBy: { createdAt: "desc" },
    select: { status: true, finishedAt: true },
  });
  if (!job) return null;
  if (job.status === "QUEUED" || job.status === "RUNNING" || job.status === "RETRY_WAIT" || job.status === "READY") {
    return "building";
  }
  if (job.status === "NEEDS_CONFIRMATION") return "confirm";
  const recent = job.finishedAt ? Date.now() - job.finishedAt.getTime() < RECENT_MS : false;
  if (!recent) return null;
  if (job.status === "APPLIED") return "ready";
  if (job.status === "FAILED") return "failed";
  return null;
}
