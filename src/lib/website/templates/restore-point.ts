import type { SerializedNodes } from "@craftjs/core";
import type { Prisma } from "@/generated/prisma/client";
import { extractWebsiteStudio } from "@/lib/studio/storage";
import { STUDIO_VERSION, type StudioPayload, type StudioTemplateId } from "@/lib/studio/types";
import type { InstantiatedTemplate } from "./instantiate";

/** Draft-only key: stripped from published snapshots. */
export const TEMPLATE_RESTORE_KEY = "websiteTemplateRestorePoint";

export type TemplateRestorePoint = {
  packageId: string;
  savedAt: string;
  templateId: StudioTemplateId | null;
  /** Previous layouts of only the pages the template replaced (absent = had none). */
  pages: Record<string, SerializedNodes | null>;
};

function asObject(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === "object" && !Array.isArray(raw) ? { ...(raw as Record<string, unknown>) } : {};
}

function layoutFor(studio: StudioPayload | undefined, key: string): SerializedNodes | undefined {
  if (!studio) return undefined;
  return key === "home" ? studio.nodes : studio.pageNodes?.[key];
}

function withLayouts(
  studio: StudioPayload | undefined,
  templateId: StudioTemplateId,
  pages: Record<string, SerializedNodes | null>,
): StudioPayload {
  const pageNodes = { ...(studio?.pageNodes ?? {}) };
  let nodes = studio?.nodes;
  for (const [key, layout] of Object.entries(pages)) {
    if (key === "home") nodes = layout ?? undefined;
    if (layout) pageNodes[key] = layout;
    else delete pageNodes[key];
  }
  return { version: STUDIO_VERSION, engine: "craft", templateId, nodes, pageNodes };
}

export function readTemplateRestorePoint(raw: unknown): TemplateRestorePoint | null {
  const point = asObject(raw)[TEMPLATE_RESTORE_KEY];
  if (!point || typeof point !== "object") return null;
  const p = point as Partial<TemplateRestorePoint>;
  return typeof p.packageId === "string" && p.pages && typeof p.pages === "object"
    ? (p as TemplateRestorePoint)
    : null;
}

/** Replaces only the template's pages; custom pages and everything else are untouched. */
export function applyTemplateToDraft(
  raw: unknown,
  packageId: string,
  instance: InstantiatedTemplate,
  now: Date,
): Prisma.InputJsonValue {
  const base = asObject(raw);
  const studio = extractWebsiteStudio(raw);
  const previous: TemplateRestorePoint = {
    packageId,
    savedAt: now.toISOString(),
    templateId: studio?.templateId ?? null,
    pages: Object.fromEntries(Object.keys(instance.pages).map((k) => [k, layoutFor(studio, k) ?? null])),
  };
  const websiteStudio = withLayouts(studio, instance.templateId, instance.pages);
  return { ...base, websiteStudio, [TEMPLATE_RESTORE_KEY]: previous } as Prisma.InputJsonValue;
}

/** Puts back the layouts the template replaced. Returns null when there's nothing to undo. */
export function undoTemplateOnDraft(raw: unknown): Prisma.InputJsonValue | null {
  const point = readTemplateRestorePoint(raw);
  if (!point) return null;
  const base = asObject(raw);
  delete base[TEMPLATE_RESTORE_KEY];
  const studio = extractWebsiteStudio(raw);
  const templateId = point.templateId ?? studio?.templateId ?? "market";
  return { ...base, websiteStudio: withLayouts(studio, templateId, point.pages) } as Prisma.InputJsonValue;
}

export function withoutDraftOnlyKeys(raw: unknown): Prisma.InputJsonValue {
  const base = asObject(raw);
  delete base[TEMPLATE_RESTORE_KEY];
  return base as Prisma.InputJsonValue;
}
