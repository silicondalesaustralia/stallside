import type { SerializedNodes } from "@craftjs/core";
import type { Prisma } from "@/generated/prisma/client";
import { parseStorefrontConfig } from "@/lib/storefront/config";
import type { StorefrontConfig } from "@/lib/storefront/types";
import { extractCraftSpike } from "@/lib/craft/storage";
import {
  STUDIO_VERSION,
  type StudioPayload,
  type StudioTemplateId,
  defaultTemplateForMode,
} from "./types";
import type { BusinessMode } from "@/lib/business-mode";
import { STUDIO_HOME_PAGE_KEY, type StudioPageNodesMap } from "./custom-pages";

export type StorefrontConfigWithStudio = StorefrontConfig & {
  websiteStudio?: StudioPayload;
};

function isSerializedNodes(raw: unknown): raw is SerializedNodes {
  if (!raw || typeof raw !== "object") return false;
  return Object.values(raw).every(
    (node) => node && typeof node === "object" && "type" in node,
  );
}

function isTemplateId(raw: unknown): raw is StudioTemplateId {
  return raw === "artisan" || raw === "farmhouse" || raw === "market";
}

function parsePageNodes(raw: unknown): StudioPageNodesMap | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const map: StudioPageNodesMap = {};
  for (const [key, value] of Object.entries(raw)) {
    if (isSerializedNodes(value)) map[key] = value;
  }
  return Object.keys(map).length > 0 ? map : undefined;
}

function normalizeStudioPayload(obj: Partial<StudioPayload>): StudioPayload | undefined {
  if (obj.version !== STUDIO_VERSION || obj.engine !== "craft") return undefined;
  if (!isTemplateId(obj.templateId)) return undefined;

  const pageNodes = parsePageNodes(obj.pageNodes);
  const homeFromPages = pageNodes?.[STUDIO_HOME_PAGE_KEY];
  const nodes = isSerializedNodes(obj.nodes)
    ? obj.nodes
    : homeFromPages;

  if (!nodes) return undefined;

  const mergedPageNodes = pageNodes ?? {};
  if (!mergedPageNodes[STUDIO_HOME_PAGE_KEY] && isSerializedNodes(obj.nodes)) {
    mergedPageNodes[STUDIO_HOME_PAGE_KEY] = obj.nodes;
  }

  return {
    version: STUDIO_VERSION,
    engine: "craft",
    templateId: obj.templateId,
    nodes,
    pageNodes: Object.keys(mergedPageNodes).length > 0 ? mergedPageNodes : undefined,
  };
}

export function extractWebsiteStudio(raw: unknown): StudioPayload | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const studio = (raw as { websiteStudio?: unknown }).websiteStudio;
  if (!studio || typeof studio !== "object") return undefined;
  return normalizeStudioPayload(studio as Partial<StudioPayload>);
}

/** Legacy craft spike v1 — read-only fallback for migration preview */
export function extractStudioFromDraft(raw: unknown): StudioPayload | undefined {
  const studio = extractWebsiteStudio(raw);
  if (studio) return studio;
  const legacy = extractCraftSpike(raw);
  if (!legacy) return undefined;
  return {
    version: STUDIO_VERSION,
    engine: "craft",
    templateId: "artisan",
    nodes: legacy.nodes,
  };
}

export function parseDraftConfigWithStudio(raw: unknown): StorefrontConfigWithStudio {
  const base = parseStorefrontConfig(raw);
  const websiteStudio = extractWebsiteStudio(raw);
  return websiteStudio ? { ...base, websiteStudio } : base;
}

export function studioPageNodes(
  studio: StudioPayload,
  pageKey: string,
): SerializedNodes | undefined {
  if (pageKey === STUDIO_HOME_PAGE_KEY) return studio.nodes;
  return studio.pageNodes?.[pageKey];
}

function mergeRawBase(existingRaw: unknown): Record<string, unknown> {
  return existingRaw && typeof existingRaw === "object" && !Array.isArray(existingRaw)
    ? { ...(existingRaw as Record<string, unknown>) }
    : {};
}

export function mergeWebsiteStudioIntoRaw(
  existingRaw: unknown,
  templateId: StudioTemplateId,
  nodes: SerializedNodes,
  pageNodes?: StudioPageNodesMap,
): Prisma.InputJsonValue {
  const base = mergeRawBase(existingRaw);
  const existing = extractWebsiteStudio(existingRaw);
  const mergedPageNodes: StudioPageNodesMap = {
    ...(existing?.pageNodes ?? {}),
    ...(pageNodes ?? {}),
    [STUDIO_HOME_PAGE_KEY]: nodes,
  };

  const websiteStudio: StudioPayload = {
    version: STUDIO_VERSION,
    engine: "craft",
    templateId,
    nodes,
    pageNodes: mergedPageNodes,
  };
  return { ...base, websiteStudio } as Prisma.InputJsonValue;
}

export function mergeWebsiteStudioPageIntoRaw(
  existingRaw: unknown,
  templateId: StudioTemplateId,
  pageKey: string,
  nodes: SerializedNodes,
): Prisma.InputJsonValue {
  const base = mergeRawBase(existingRaw);
  const existing = extractWebsiteStudio(existingRaw);
  const homepageNodes = existing?.nodes ?? nodes;
  const mergedPageNodes: StudioPageNodesMap = {
    ...(existing?.pageNodes ?? {}),
    [pageKey]: nodes,
  };

  const websiteStudio: StudioPayload = {
    version: STUDIO_VERSION,
    engine: "craft",
    templateId: existing?.templateId ?? templateId,
    nodes: homepageNodes,
    pageNodes: mergedPageNodes,
  };
  return { ...base, websiteStudio } as Prisma.InputJsonValue;
}

export function readStudioFromStorefrontJson(
  raw: unknown,
  usePublished: boolean,
  publishedRaw: unknown | null,
): StudioPayload | null {
  const source = usePublished && publishedRaw ? publishedRaw : raw;
  return extractStudioFromDraft(source) ?? null;
}

export function defaultTemplateId(
  stored: StudioPayload | null,
  businessMode: BusinessMode,
): StudioTemplateId {
  return stored?.templateId ?? defaultTemplateForMode(businessMode);
}
