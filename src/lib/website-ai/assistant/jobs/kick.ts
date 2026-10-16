import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { processJob } from "./process";

export const WORKER_BUDGET_MS = 270_000;
const MIN_RUN_MS = 30_000;
const MAX_RUNS = 6;
const ACTIVE = ["QUEUED", "RUNNING", "RETRY_WAIT"] as const;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Processes the job, then waits out short retry delays and continues within the same budget,
 * so a build finishes even when nobody keeps the page open (Preview has no cron).
 */
async function runUntilDone(jobId: string): Promise<void> {
  const deadline = Date.now() + WORKER_BUDGET_MS;
  for (let run = 0; run < MAX_RUNS; run += 1) {
    if (deadline - Date.now() < MIN_RUN_MS) return;
    await processJob(jobId, deadline - Date.now());
    const job = await prisma.websiteGenerationJob.findUnique({
      where: { id: jobId },
      select: { status: true, nextAttemptAt: true, leaseExpiresAt: true },
    });
    if (!job || !(ACTIVE as readonly string[]).includes(job.status)) return;
    if (job.leaseExpiresAt && job.leaseExpiresAt.getTime() > Date.now()) return;
    const wait = Math.max(0, job.nextAttemptAt.getTime() - Date.now());
    if (wait + MIN_RUN_MS > deadline - Date.now()) return;
    await sleep(wait);
  }
}

/** Schedules processing after the response when the job is due and nobody holds its lease. */
export async function kickJobIfIdle(jobId: string): Promise<boolean> {
  const now = new Date();
  const due = await prisma.websiteGenerationJob.count({
    where: {
      id: jobId,
      status: { in: [...ACTIVE] },
      nextAttemptAt: { lte: now },
      OR: [{ leaseExpiresAt: null }, { leaseExpiresAt: { lt: now } }],
    },
  });
  if (due === 0) return false;
  after(async () => {
    try {
      await runUntilDone(jobId);
    } catch (err) {
      console.error("[website-ai] background processing failed", jobId, err instanceof Error ? err.message : err);
    }
  });
  return true;
}
