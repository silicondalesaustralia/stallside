import { prisma } from "@/lib/prisma";
import { isJobStage, JOB_STAGES, parseJobState, STAGE_LABELS } from "./state";

export type JobStatusView = {
  id: string;
  status: string;
  stage: string;
  stageLabel: string;
  progress: number;
  notes: string[];
  error: string | null;
  reviewPageIds: string[];
  keptPolicyPageIds: string[];
  appliedAt: string | null;
  canRestore: boolean;
  pagesWritten: number;
  pagesPlanned: number;
};

const FRIENDLY_ERRORS: Record<string, string> = {
  compile: "We couldn't build a homepage from the details given. Add a little more about your business and try again.",
  storefront_missing: "Your website could not be found.",
  internal: "Something went wrong while building. Try again in a minute.",
  superseded: "A newer build replaced this one.",
};

export async function loadJobStatus(ownerId: string, jobId: string): Promise<JobStatusView | null> {
  const job = await prisma.websiteGenerationJob.findFirst({ where: { id: jobId, ownerId } });
  if (!job) return null;
  const state = parseJobState(job.state);
  const stage = isJobStage(job.stage) ? job.stage : "prepare";
  const pagesPlanned = state.plan?.pages.length ?? 0;
  const pagesWritten = Object.keys(state.contents ?? {}).length;
  const stageIndex = JOB_STAGES.indexOf(stage);
  const pageShare = stage === "pages" && pagesPlanned > 0 ? pagesWritten / pagesPlanned : 0;
  const progress = job.status === "APPLIED" ? 100 : Math.round(((stageIndex + pageShare) / (JOB_STAGES.length - 1)) * 100);
  const failed = job.status === "FAILED" || job.status === "CANCELLED";
  return {
    id: job.id,
    status: job.status,
    stage,
    stageLabel: STAGE_LABELS[stage],
    progress: Math.min(100, Math.max(0, progress)),
    notes: state.notes ?? [],
    error: failed && job.errorCode ? FRIENDLY_ERRORS[job.errorCode] ?? "The build stopped. Try again." : null,
    reviewPageIds: state.reviewPageIds ?? [],
    keptPolicyPageIds: state.keptPolicyPageIds ?? [],
    appliedAt: job.appliedAt?.toISOString() ?? null,
    canRestore: job.status === "APPLIED" && !job.restoredAt && job.restoreDraft !== null,
    pagesWritten,
    pagesPlanned,
  };
}
