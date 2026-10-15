import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { Lease } from "./lease";
import { stateJson, type JobState } from "./state";

class ApplyAbort extends Error {
  constructor(readonly reason: "conflict" | "lease") {
    super(reason);
  }
}

export type ApplyResult = { ok: true; revision: number } | { ok: false; reason: "conflict" | "lease" };

/**
 * Writes the candidate draft and marks the job applied in one transaction. The draft write is
 * compare-and-set on `draftRevision`; the previous draft is kept on the job as the restore point.
 */
export async function applyCandidateTx(input: {
  lease: Lease;
  ownerId: string;
  storefrontId: string;
  expectedRevision: number;
  draft: Record<string, unknown>;
  restoreDraft: unknown;
  state: JobState;
}): Promise<ApplyResult> {
  const draftJson = JSON.parse(JSON.stringify(input.draft)) as Prisma.InputJsonValue;
  const restoreJson = JSON.parse(JSON.stringify(input.restoreDraft ?? {})) as Prisma.InputJsonValue;
  try {
    await prisma.$transaction(async (tx) => {
      const written = await tx.storefront.updateMany({
        where: { id: input.storefrontId, ownerId: input.ownerId, draftRevision: input.expectedRevision },
        data: { draftConfig: draftJson, draftRevision: { increment: 1 } },
      });
      if (written.count !== 1) throw new ApplyAbort("conflict");
      const now = new Date();
      const job = await tx.websiteGenerationJob.updateMany({
        where: { id: input.lease.jobId, leaseToken: input.lease.token },
        data: {
          status: "APPLIED",
          stage: "done",
          state: stateJson(input.state),
          candidate: draftJson,
          restoreDraft: restoreJson,
          appliedRevision: input.expectedRevision + 1,
          appliedAt: now,
          finishedAt: now,
          activeLock: null,
          leaseToken: null,
          leaseExpiresAt: null,
        },
      });
      if (job.count !== 1) throw new ApplyAbort("lease");
    });
    return { ok: true, revision: input.expectedRevision + 1 };
  } catch (err) {
    if (err instanceof ApplyAbort) return { ok: false, reason: err.reason };
    throw err;
  }
}
