import { createHash } from "crypto";
import { cleanEnvSecret } from "@/lib/env";

/** Master switch — keep off to leave classic Studio as the only path. */
export function aiWebsiteBuilderEnabled(): boolean {
  return process.env.AI_WEBSITE_BUILDER_ENABLED === "1";
}

export function websiteAiProviderName(): "openai" | "heuristic" {
  const raw = process.env.WEBSITE_AI_PROVIDER?.trim().toLowerCase();
  if (raw === "openai") return "openai";
  return "heuristic";
}

export function websiteAiModel(): string {
  return process.env.WEBSITE_AI_MODEL?.trim() || "gpt-4o";
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
