import type { SerializedNodes } from "@craftjs/core";
import type { StudioPayload } from "@/lib/studio/types";
import { STUDIO_VERSION } from "@/lib/studio/types";
import { validateStudioNodes } from "@/lib/studio/validate-state";
import { AI_TO_CRAFT_SECTION, craftPropsForAiSection } from "./section-map";
import type { AISitePlan } from "./types";

function nodeId(prefix: string, index: number): string {
  return `${prefix}_${index}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Compile HOME page of an AI plan into Craft SerializedNodes. */
export function compileHomeNodes(plan: AISitePlan): SerializedNodes {
  const home = plan.pages.find((p) => p.pageType === "HOME");
  if (!home) throw new Error("No HOME page in plan");

  const sectionIds: string[] = [];
  const nodes: SerializedNodes = {} as SerializedNodes;

  home.sections.forEach((section, index) => {
    const id = section.id || nodeId("sec", index);
    sectionIds.push(id);
    const craftType = AI_TO_CRAFT_SECTION[section.type];
    nodes[id] = {
      type: { resolvedName: craftType },
      isCanvas: false,
      props: craftPropsForAiSection(section, plan.designSystem),
      displayName: craftType,
      custom: { aiSectionId: section.id, aiType: section.type },
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
    custom: { source: "website-ai", planVersion: plan.version },
    hidden: false,
    nodes: sectionIds,
    linkedNodes: {},
    parent: null,
  };

  return nodes;
}

export function compilePlanToStudioPayload(plan: AISitePlan): {
  payload: StudioPayload | null;
  errors: string[];
} {
  const nodes = compileHomeNodes(plan);
  const validation = validateStudioNodes(nodes);
  if (!validation.ok) {
    return { payload: null, errors: validation.errors };
  }
  return {
    payload: {
      version: STUDIO_VERSION,
      engine: "craft",
      templateId: plan.designSystem,
      nodes,
    },
    errors: [],
  };
}
