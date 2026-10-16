import { websiteAiModel } from "@/lib/website-ai/config";
import type { StepOutcome } from "../jobs/outcome";
import { recordImageUsage, recordTextUsage, type UsageOwner } from "./record";

type JobRef = { id: string; ownerId: string; storefrontId: string; modelRequested: string | null };

/** Records the AI and image usage of one build step. Returns its estimated cost in USD micros. */
export async function recordStepUsage(job: JobRef, outcome: StepOutcome): Promise<number> {
  if (outcome.kind !== "next" && outcome.kind !== "retry") return 0;
  const owner: UsageOwner = { ownerId: job.ownerId, storefrontId: job.storefrontId, jobId: job.id };
  let micros = 0;
  if (outcome.usage) {
    const model = (outcome.kind === "next" ? outcome.model : undefined) ?? job.modelRequested ?? websiteAiModel();
    micros += await recordTextUsage(owner, "website_build", model, outcome.usage, outcome.kind === "next" ? "success" : "failed");
  }
  if (outcome.kind === "next" && outcome.images) {
    micros += await recordImageUsage(owner, outcome.imageModel ?? "unknown", outcome.images, outcome.imageUsage ?? null);
  }
  return micros;
}
