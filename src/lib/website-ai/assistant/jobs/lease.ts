import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { AiUsage } from "../ai/result";

export const LEASE_MS = 90_000;
const RUNNABLE = ["QUEUED", "RUNNING", "RETRY_WAIT"] as const;

export type Lease = { jobId: string; token: string };

/** Claims a runnable job; a lease left by a crashed worker is recoverable once it expires. */
export async function claimJob(jobId: string): Promise<Lease | null> {
  const now = new Date();
  const token = randomUUID();
  const claimed = await prisma.websiteGenerationJob.updateMany({
    where: {
      id: jobId,
      status: { in: [...RUNNABLE] },
      nextAttemptAt: { lte: now },
      OR: [{ leaseExpiresAt: null }, { leaseExpiresAt: { lt: now } }],
    },
    data: { status: "RUNNING", leaseToken: token, leaseExpiresAt: new Date(now.getTime() + LEASE_MS) },
  });
  return claimed.count === 1 ? { jobId, token } : null;
}

/** Fenced update: only the current lease holder may write. Returns false when the lease was lost. */
export async function writeLeased(lease: Lease, data: Prisma.WebsiteGenerationJobUpdateManyMutationInput): Promise<boolean> {
  const res = await prisma.websiteGenerationJob.updateMany({
    where: { id: lease.jobId, leaseToken: lease.token },
    data: { ...data, leaseExpiresAt: new Date(Date.now() + LEASE_MS) },
  });
  return res.count === 1;
}

export async function releaseLease(lease: Lease, data: Prisma.WebsiteGenerationJobUpdateManyMutationInput): Promise<boolean> {
  const res = await prisma.websiteGenerationJob.updateMany({
    where: { id: lease.jobId, leaseToken: lease.token },
    data: { ...data, leaseToken: null, leaseExpiresAt: null },
  });
  return res.count === 1;
}

export function usageData(usage: AiUsage | undefined): Prisma.WebsiteGenerationJobUpdateManyMutationInput {
  if (!usage) return {};
  if (!usage.known) return { usageUnknownCalls: { increment: 1 } };
  return {
    inputTokens: { increment: usage.inputTokens },
    outputTokens: { increment: usage.outputTokens },
    reasoningTokens: { increment: usage.reasoningTokens },
  };
}

/** Exponential backoff with jitter; a provider Retry-After wins when longer. */
export function retryDelayMs(attempt: number, retryAfterMs?: number): number {
  const base = Math.min(120_000, 5_000 * 2 ** Math.max(0, attempt - 1));
  const jitter = Math.floor(Math.random() * 2_000);
  return Math.max(base + jitter, retryAfterMs ?? 0);
}

export const MAX_ATTEMPTS = 5;

/** Jobs whose next step is due, oldest first (used by the cron processor). */
export async function dueJobIds(limit: number): Promise<string[]> {
  const now = new Date();
  const rows = await prisma.websiteGenerationJob.findMany({
    where: {
      status: { in: [...RUNNABLE] },
      nextAttemptAt: { lte: now },
      OR: [{ leaseExpiresAt: null }, { leaseExpiresAt: { lt: now } }],
    },
    orderBy: { nextAttemptAt: "asc" },
    take: limit,
    select: { id: true },
  });
  return rows.map((r) => r.id);
}
