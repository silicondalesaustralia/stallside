import type { AiUsage } from "../ai/result";
import type { BriefData } from "../brief/schema";
import type { JobContext } from "./context";
import type { JobStage, JobState } from "./state";

export type StepInput = {
  job: {
    id: string;
    ownerId: string;
    storefrontId: string;
    mode: string;
    attempts: number;
    baseDraftRevision: number;
  };
  brief: BriefData;
  context: JobContext;
  state: JobState;
  budgetMs: number;
};

export type StepOutcome =
  | { kind: "next"; stage: JobStage; state: JobState; usage?: AiUsage; model?: string; images?: number }
  | { kind: "wait"; state: JobState }
  | { kind: "retry"; state: JobState; code: string; message: string; retryAfterMs?: number; usage?: AiUsage }
  | { kind: "confirm"; state: JobState; candidate: Record<string, unknown> }
  | { kind: "apply"; state: JobState; expectedRevision: number; candidate: Record<string, unknown>; restoreDraft: unknown }
  | { kind: "failed"; code: string; message: string };
