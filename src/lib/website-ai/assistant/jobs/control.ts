import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { writeStorefrontDraft } from "@/lib/website/persistence/draft-store";
import { parseJobState, stateJson } from "./state";

export type ControlResult = { ok: true } | { ok: false; error: string };

const ACTIVE = ["QUEUED", "RUNNING", "RETRY_WAIT"] as const;

export async function cancelJob(ownerId: string, jobId: string): Promise<ControlResult> {
  const now = new Date();
  const idle = await prisma.websiteGenerationJob.updateMany({
    where: {
      id: jobId,
      ownerId,
      OR: [
        { status: "NEEDS_CONFIRMATION" },
        { status: { in: [...ACTIVE] }, OR: [{ leaseToken: null }, { leaseExpiresAt: { lt: now } }] },
      ],
    },
    data: { status: "CANCELLED", finishedAt: now, activeLock: null, cancelRequestedAt: now, leaseToken: null },
  });
  if (idle.count === 1) return { ok: true };
  const running = await prisma.websiteGenerationJob.updateMany({
    where: { id: jobId, ownerId, status: { in: [...ACTIVE] } },
    data: { cancelRequestedAt: now },
  });
  return running.count === 1 ? { ok: true } : { ok: false, error: "This build has already finished." };
}

/** Seller chose to replace a draft that changed while the build ran. */
export async function confirmReplace(ownerId: string, jobId: string): Promise<ControlResult> {
  const job = await prisma.websiteGenerationJob.findFirst({
    where: { id: jobId, ownerId, status: "NEEDS_CONFIRMATION" },
    select: { state: true, storefrontId: true },
  });
  if (!job) return { ok: false, error: "This build is no longer waiting for you." };
  const state = { ...parseJobState(job.state), confirmed: true };
  try {
    const res = await prisma.websiteGenerationJob.updateMany({
      where: { id: jobId, ownerId, status: "NEEDS_CONFIRMATION" },
      data: {
        status: "QUEUED",
        stage: "apply",
        state: stateJson(state),
        attempts: 0,
        nextAttemptAt: new Date(),
        activeLock: job.storefrontId,
      },
    });
    return res.count === 1 ? { ok: true } : { ok: false, error: "This build is no longer waiting for you." };
  } catch (err) {
    console.error("[website-ai] confirm replace failed", err instanceof Error ? err.message : err);
    return { ok: false, error: "Another build is running. Wait for it to finish, then try again." };
  }
}

/** Puts back the draft exactly as it was before this build was applied. */
export async function restorePrevious(ownerId: string, jobId: string): Promise<ControlResult> {
  const job = await prisma.websiteGenerationJob.findFirst({
    where: { id: jobId, ownerId, status: "APPLIED", restoredAt: null },
    select: { restoreDraft: true, storefrontId: true, appliedAt: true },
  });
  if (!job?.restoreDraft) return { ok: false, error: "There is no earlier version to restore." };
  const newer = await prisma.websiteGenerationJob.count({
    where: { storefrontId: job.storefrontId, status: "APPLIED", appliedAt: { gt: job.appliedAt ?? new Date(0) } },
  });
  if (newer > 0) return { ok: false, error: "A newer build was applied. Restore from the latest build instead." };
  const storefront = await prisma.storefront.findFirst({
    where: { id: job.storefrontId, ownerId },
    select: { draftRevision: true },
  });
  if (!storefront) return { ok: false, error: "Website not found." };
  const saved = await writeStorefrontDraft({
    ownerId,
    expectedRevision: storefront.draftRevision,
    draftConfig: job.restoreDraft as Prisma.InputJsonValue,
  });
  if (!saved.ok) return { ok: false, error: "Your draft changed just now. Try again." };
  await prisma.websiteGenerationJob.update({ where: { id: jobId }, data: { restoredAt: new Date() } });
  return { ok: true };
}
