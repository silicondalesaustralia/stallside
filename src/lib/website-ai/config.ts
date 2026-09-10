import { createHash } from "crypto";
import { cleanEnvSecret } from "@/lib/env";

/** Master switch — keep off to leave classic Studio as the only path. */
export function aiWebsiteBuilderEnabled(): boolean {
  return process.env.AI_WEBSITE_BUILDER_ENABLED === "1";
}

export type WebsiteAiProviderId = "astra" | "openai" | "heuristic";

/**
 * Primary planner. `astra` / `openai` both call OpenAI;
 * `astra` defaults the model to gpt-6-astra.
 */
export function websiteAiProviderName(): WebsiteAiProviderId {
  const raw = process.env.WEBSITE_AI_PROVIDER?.trim().toLowerCase();
  if (raw === "heuristic") return "heuristic";
  if (raw === "openai") return "openai";
  if (raw === "astra" || raw === "gpt-6-astra" || raw === "gpt6") return "astra";
  // Prefer Astra when a key is present; otherwise stay on heuristic for local/dev.
  return openaiApiKey() ? "astra" : "heuristic";
}

export function websiteAiModel(): string {
  const configured = process.env.WEBSITE_AI_MODEL?.trim();
  if (configured) return configured;
  const provider = websiteAiProviderName();
  if (provider === "astra") return "gpt-6-astra";
  if (provider === "openai") return "gpt-4o";
  return "rules-v1";
}

/** Reasoning effort for GPT-6 Astra Responses API. */
export function websiteAiReasoningEffort():
  | "low"
  | "medium"
  | "high"
  | "xhigh"
  | "max" {
  const raw = process.env.WEBSITE_AI_REASONING_EFFORT?.trim().toLowerCase();
  if (
    raw === "low" ||
    raw === "medium" ||
    raw === "high" ||
    raw === "xhigh" ||
    raw === "max"
  ) {
    return raw;
  }
  return "medium";
}

export function openaiApiKey(): string | null {
  return cleanEnvSecret(process.env.OPENAI_API_KEY);
}

function allowlistedOwnerIds(): Set<string> {
  const raw = process.env.AI_WEBSITE_BUILDER_OWNER_IDS?.trim() ?? "";
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

/** 0–100. When unset and allowlist empty, enabled owners = all (100). */
function cohortPercent(): number {
  const raw = process.env.AI_WEBSITE_BUILDER_PERCENT?.trim();
  if (raw == null || raw === "") return 100;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.floor(n)));
}

function ownerBucket(ownerId: string): number {
  const hash = createHash("sha256").update(`website-ai:${ownerId}`).digest();
  return hash[0]! % 100;
}

/**
 * A/B gate: master flag + optional allowlist + percent cohort.
 * Classic Studio remains available either way.
 */
export function ownerInAiWebsiteBuilderCohort(ownerId: string): boolean {
  if (!aiWebsiteBuilderEnabled()) return false;
  const allow = allowlistedOwnerIds();
  if (allow.size > 0 && allow.has(ownerId)) return true;
  if (allow.size > 0 && cohortPercent() === 0) return false;
  return ownerBucket(ownerId) < cohortPercent();
}

export function canUseAiWebsiteBuilder(ownerId: string): boolean {
  return ownerInAiWebsiteBuilderCohort(ownerId);
}
