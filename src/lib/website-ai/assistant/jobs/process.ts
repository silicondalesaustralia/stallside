import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { parseBriefData } from "../brief/schema";
import { cancelBackground } from "../ai/client";
import { applyCandidateTx } from "./apply";
import { loadJobContext, type JobContext } from "./context";
import { claimJob, MAX_ATTEMPTS, releaseLease, retryDelayMs, usageData, writeLeased, type Lease } from "./lease";
import type { StepOutcome } from "./outcome";
import { isJobStage, parseJobState, stateJson } from "./state";
import { runStage } from "./steps";
import { recordStepUsage } from "../usage/job";

const MIN_STEP_MS = 10_000;
const AI_MARGIN_MS = 5_000;
function terminal() {
  return { finishedAt: new Date(), activeLock: null };
}

function later(ms: number): Date {
  return new Date(Date.now() + ms);
}

async function finish(lease: Lease, attempts: number, outcome: StepOutcome, costMicros = 0): Promise<boolean> {
  switch (outcome.kind) {
    case "next":
      await writeLeased(lease, {
        stage: outcome.stage,
        state: stateJson(outcome.state),
        attempts: 0,
        ...usageData(outcome.usage, costMicros),
        ...(outcome.model ? { modelUsed: outcome.model } : {}),
        ...(outcome.images ? { imageCount: { increment: outcome.images } } : {}),
      });
      return true;
    case "wait":
      await releaseLease(lease, { state: stateJson(outcome.state), nextAttemptAt: later(2_000) });
      return false;
    case "retry":
      await releaseLease(lease, {
        status: "RETRY_WAIT",
        state: stateJson(outcome.state),
        attempts: { increment: 1 },
        nextAttemptAt: later(retryDelayMs(attempts + 1, outcome.retryAfterMs)),
        errorCode: outcome.code,
        errorMessage: outcome.message.slice(0, 500),
        ...usageData(outcome.usage, costMicros),
      });
      return false;
    case "confirm":
      await releaseLease(lease, {
        status: "NEEDS_CONFIRMATION",
        state: stateJson(outcome.state),
        candidate: JSON.parse(JSON.stringify(outcome.candidate)) as Prisma.InputJsonValue,
        activeLock: null,
      });
      return false;
    case "failed":
      await releaseLease(lease, { status: "FAILED", errorCode: outcome.code, errorMessage: outcome.message.slice(0, 500), ...terminal() });
      return false;
    case "apply":
      return false;
  }
}

/** Runs as many steps as fit in the budget. Safe to call from any worker: the lease fences writes. */
export async function processJob(jobId: string, budgetMs: number): Promise<void> {
  const lease = await claimJob(jobId);
  if (!lease) return;
  const deadline = Date.now() + budgetMs;
  let context: JobContext | null = null;
  let attempts = 0;
  try {
    for (;;) {
      const job = await prisma.websiteGenerationJob.findUnique({ where: { id: jobId } });
      if (!job || job.leaseToken !== lease.token) return;
      attempts = job.attempts;
      const state = parseJobState(job.state);
      if (job.cancelRequestedAt) {
        if (state.pending) await cancelBackground(state.pending.responseId);
        await releaseLease(lease, { status: "CANCELLED", ...terminal() });
        return;
      }
      const remaining = deadline - Date.now();
      if (remaining < MIN_STEP_MS) {
        await releaseLease(lease, { nextAttemptAt: new Date() });
        return;
      }
      if (!isJobStage(job.stage)) {
        await finish(lease, attempts, { kind: "failed", code: "bad_stage", message: `Unknown stage ${job.stage}` });
        return;
      }
      context ??= await loadJobContext(job.ownerId, job.storefrontId);
      if (!context) {
        await finish(lease, attempts, { kind: "failed", code: "storefront_missing", message: "Website not found." });
        return;
      }
      const outcome = await runStage(job.stage, {
        job,
        brief: parseBriefData(job.briefSnapshot),
        context,
        state,
        budgetMs: remaining - AI_MARGIN_MS,
      });
      if (outcome.kind === "apply") {
        const applied = await applyCandidateTx({
          lease,
          ownerId: job.ownerId,
          storefrontId: job.storefrontId,
          expectedRevision: outcome.expectedRevision,
          draft: outcome.candidate,
          restoreDraft: outcome.restoreDraft,
          state: outcome.state,
        });
        if (!applied.ok && applied.reason === "conflict") {
          await finish(lease, attempts, attempts + 1 >= MAX_ATTEMPTS
            ? { kind: "confirm", state: outcome.state, candidate: outcome.candidate }
            : { kind: "retry", state: outcome.state, code: "draft_conflict", message: "Draft changed while saving." });
        }
        return;
      }
      if (!(await finish(lease, attempts, outcome, await recordStepUsage(job, outcome)))) return;
    }
  } catch (err) {
    console.error("[website-ai] job step crashed", jobId, err instanceof Error ? err.message : err);
    const giveUp = attempts + 1 >= MAX_ATTEMPTS;
    await releaseLease(lease, giveUp
      ? { status: "FAILED", errorCode: "internal", errorMessage: "The build hit an unexpected error.", ...terminal() }
      : { status: "RETRY_WAIT", attempts: { increment: 1 }, nextAttemptAt: later(retryDelayMs(attempts + 1)), errorCode: "internal" },
    ).catch((e: unknown) => console.error("[website-ai] release after crash failed", jobId, e instanceof Error ? e.message : e));
  }
}
