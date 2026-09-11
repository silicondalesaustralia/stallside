import type { Prisma } from "@/generated/prisma/client";
import type { AISitePlan, WebsiteGenerationIntent } from "./types";
import type { BrandLookCombo } from "@/lib/website/brand-looks";

export const WEBSITE_AI_SCAFFOLD_VERSION = 1 as const;

export type WebsiteAiScaffold = {
  version: typeof WEBSITE_AI_SCAFFOLD_VERSION;
  plan: AISitePlan;
  intent: WebsiteGenerationIntent;
  looks: BrandLookCombo[];
  createdAt: string;
};

export function extractWebsiteAiScaffold(raw: unknown): WebsiteAiScaffold | null {
  if (!raw || typeof raw !== "object") return null;
  const scaffold = (raw as { websiteAiScaffold?: unknown }).websiteAiScaffold;
  if (!scaffold || typeof scaffold !== "object") return null;
  const obj = scaffold as Partial<WebsiteAiScaffold>;
  if (obj.version !== WEBSITE_AI_SCAFFOLD_VERSION) return null;
  if (!obj.plan || !Array.isArray(obj.looks) || obj.looks.length < 1) return null;
  return {
    version: WEBSITE_AI_SCAFFOLD_VERSION,
    plan: obj.plan,
    intent: obj.intent ?? {},
    looks: obj.looks,
    createdAt: typeof obj.createdAt === "string" ? obj.createdAt : new Date().toISOString(),
  };
}

export function mergeWebsiteAiScaffoldIntoRaw(
  raw: unknown,
  scaffold: WebsiteAiScaffold | null,
): Prisma.InputJsonValue {
  const base =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? { ...(raw as Record<string, unknown>) }
      : {};
  if (!scaffold) {
    delete base.websiteAiScaffold;
  } else {
    base.websiteAiScaffold = scaffold;
  }
  return base as Prisma.InputJsonValue;
}
