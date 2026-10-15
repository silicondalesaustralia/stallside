import type { Prisma } from "@/generated/prisma/client";
import type { PageContent } from "../ai/schemas";
import type { DecorativeSet } from "../compile/images";
import type { NormalizedPlan } from "../plan/normalize";

export const JOB_STAGES = ["prepare", "plan", "images", "pages", "compile", "apply", "done"] as const;
export type JobStage = (typeof JOB_STAGES)[number];

/** Durable progress saved after every step so any worker can resume the job. */
export type JobState = {
  plan?: NormalizedPlan;
  /** Page copy by plan key; null means the deterministic starter copy is used. */
  contents?: Record<string, PageContent | null>;
  /** Background model response being polled. */
  pending?: { key: string; responseId: string };
  decorative?: DecorativeSet;
  /** AI unavailable for this job (basic mode, auth or model errors); starter copy is used. */
  aiOff?: boolean;
  notes?: string[];
  reviewPageIds?: string[];
  keptPolicyPageIds?: string[];
  /** Seller confirmed replacing a draft that changed during the build. */
  confirmed?: boolean;
};

export function isJobStage(value: string): value is JobStage {
  return (JOB_STAGES as readonly string[]).includes(value);
}

export function parseJobState(raw: unknown): JobState {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as JobState;
}

export function stateJson(state: JobState): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(state)) as Prisma.InputJsonValue;
}

export function addNote(state: JobState, note: string): JobState {
  const notes = [...(state.notes ?? [])];
  if (!notes.includes(note)) notes.push(note.slice(0, 300));
  return { ...state, notes: notes.slice(-20) };
}

export const STAGE_LABELS: Record<JobStage, string> = {
  prepare: "Reading your details",
  plan: "Planning your pages",
  images: "Preparing images",
  pages: "Writing your pages",
  compile: "Building your website",
  apply: "Saving your draft",
  done: "Done",
};
