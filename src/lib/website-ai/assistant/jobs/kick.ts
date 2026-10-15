import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { processJob } from "./process";

export const WORKER_BUDGET_MS = 270_000;

/** Schedules processing after the response when the job is due and nobody holds its lease. */
export async function kickJobIfIdle(jobId: string): Promise<boolean> {
  const now = new Date();
  const due = await prisma.websiteGenerationJob.count({
    where: {
      id: jobId,
      status: { in: ["QUEUED", "RUNNING", "RETRY_WAIT"] },
      nextAttemptAt: { lte: now },
      OR: [{ leaseExpiresAt: null }, { leaseExpiresAt: { lt: now } }],
    },
  });
  if (due === 0) return false;
  after(async () => {
    try {
      await processJob(jobId, WORKER_BUDGET_MS);
    } catch (err) {
      console.error("[website-ai] background processing failed", jobId, err instanceof Error ? err.message : err);
    }
  });
  return true;
}
