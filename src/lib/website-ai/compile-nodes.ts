import type { SerializedNodes } from "@craftjs/core";
import type { StudioPayload } from "@/lib/studio/types";
import { STUDIO_VERSION } from "@/lib/studio/types";
import { validateStudioNodes } from "@/lib/studio/validate-state";
import { assertNoDemoAssets } from "@/lib/website/demo-assets/reject-demo-assets";
import { AI_TO_CRAFT_SECTION, craftPropsForAiSection } from "./section-map";
import type { AISitePlan, AiSitePage, WebsitePageType } from "./types";
import { FAQ_PAGE_ID } from "./apply-selected-pages";
import type { StudioPageNodesMap } from "@/lib/studio/custom-pages";

function nodeId(prefix: string, index: number): string {
  return `${prefix}_${index}_${Math.random().toString(36).slice(2, 8)}`;
}

const PAGE_NODE_KEYS: Partial<Record<WebsitePageType, string>> = {
  HOME: "home",
  ABOUT: "builtin-about",
  CONTACT: "builtin-contact",
  FAQ: FAQ_PAGE_ID,
};

/** Compile one AI page into Craft SerializedNodes. */
export function compilePageNodes(
  page: AiSitePage,
  plan: AISitePlan,
): SerializedNodes {
  const sectionIds: string[] = [];
  const nodes: SerializedNodes = {} as SerializedNodes;

  page.sections.forEach((section, index) => {
    const rawId = section.id || nodeId("sec", index);
    const id =
      String(rawId).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64) ||
      nodeId("sec", index);
    sectionIds.push(id);
    const craftType = AI_TO_CRAFT_SECTION[section.type];
    nodes[id] = {
      type: { resolvedName: craftType },
      isCanvas: false,
      props: craftPropsForAiSection(section, plan.designSystem),
      displayName: craftType,
      custom: {
        aiSectionId: section.id,
        aiType: section.type,
        visibility: section.visibility ?? "ALL",
        productPresentation: section.productPresentation ?? "LIVE",
        copyKind: section.copyKind,
        placeholderKind: section.placeholderKind,
        placeholderRefs: section.placeholderKind
          ? [{ placeholderId: `${section.id}:${section.placeholderKind}`, propPath: "body" }]
          : undefined,
      },
      hidden: false,
      nodes: [],
      linkedNodes: {},
      parent: "ROOT",
    };
  });

  nodes.ROOT = {
    type: { resolvedName: "CraftPageRoot" },
    isCanvas: true,
    props: {},
    displayName: "CraftPageRoot",
    custom: {
      source: "website-ai",
      planVersion: plan.version,
      pageType: page.pageType,
    },
    hidden: false,
    nodes: sectionIds,
    linkedNodes: {},
    parent: null,
  };

  return nodes;
}

/** Compile HOME page of an AI plan into Craft SerializedNodes. */
export function compileHomeNodes(plan: AISitePlan): SerializedNodes {
  const home = plan.pages.find((p) => p.pageType === "HOME");
  if (!home) throw new Error("No HOME page in plan");
  return compilePageNodes(home, plan);
}

export function compilePlanToStudioPayload(plan: AISitePlan): {
  payload: StudioPayload | null;
  errors: string[];
} {
  try {
    assertNoDemoAssets(plan, "AI site plan");
  } catch (err) {
    return {
      payload: null,
      errors: [err instanceof Error ? err.message : "Demo assets forbidden"],
    };
  }

  const home = plan.pages.find((p) => p.pageType === "HOME");
  if (!home) {
    return { payload: null, errors: ["No HOME page in plan"] };
  }

  const homeNodes = compilePageNodes(home, plan);
  const homeValidation = validateStudioNodes(homeNodes);
  if (!homeValidation.ok) {
    return { payload: null, errors: homeValidation.errors };
  }

  const pageNodes: StudioPageNodesMap = { home: homeNodes };
  const errors: string[] = [];

  for (const page of plan.pages) {
    if (page.pageType === "HOME") continue;
    const key = PAGE_NODE_KEYS[page.pageType];
    if (!key || page.sections.length === 0) continue;
    try {
      const nodes = compilePageNodes(page, plan);
      const validation = validateStudioNodes(nodes);
      if (!validation.ok) {
        errors.push(...validation.errors.map((e) => `${page.pageType}: ${e}`));
        continue;
      }
      pageNodes[key] = nodes;
    } catch (err) {
      errors.push(
        `${page.pageType}: ${err instanceof Error ? err.message : "compile failed"}`,
      );
    }
  }

  return {
    payload: {
      version: STUDIO_VERSION,
      engine: "craft",
      templateId: plan.designSystem,
      nodes: homeNodes,
      pageNodes,
    },
    errors,
  };
}
