import type { SerializedNodes } from "@craftjs/core";
import type { SectionInstance } from "@/lib/website/schema/definition";
import { isVendlSectionType, sectionDefinition } from "@/lib/website/sections/registry";

function sectionProps(section: SectionInstance): Record<string, unknown> {
  const props: Record<string, unknown> = {
    ...(section.extras ?? {}),
    ...section.content,
    ...section.settings,
    ...(section.binding ?? {}),
  };
  if (isVendlSectionType(section.type)) {
    const def = sectionDefinition(section.type);
    if (def.variantProp) props[def.variantProp] = section.variant;
  }
  return props;
}

function sectionCustom(section: SectionInstance): Record<string, unknown> {
  const custom = { ...(section.editorMeta ?? {}) };
  if (section.visibility === "editorOnly") custom.visibility = "EDITOR_ONLY";
  else if (custom.visibility === "EDITOR_ONLY") delete custom.visibility;
  return custom;
}

/** Builds an in-memory Craft tree for the editor/renderer from definition sections. */
export function sectionsToCraftNodes(sections: SectionInstance[]): SerializedNodes {
  const nodes: SerializedNodes = {} as SerializedNodes;
  for (const section of sections) {
    const craftName = isVendlSectionType(section.type)
      ? sectionDefinition(section.type).craftName
      : section.type;
    nodes[section.id] = {
      type: { resolvedName: craftName },
      isCanvas: false,
      props: sectionProps(section),
      displayName: craftName,
      custom: sectionCustom(section),
      hidden: section.visibility === "hidden",
      nodes: [],
      linkedNodes: {},
      parent: "ROOT",
    };
  }
  nodes.ROOT = {
    type: { resolvedName: "CraftPageRoot" },
    isCanvas: true,
    props: {},
    displayName: "CraftPageRoot",
    custom: {},
    hidden: false,
    nodes: sections.map((s) => s.id),
    linkedNodes: {},
    parent: null,
  };
  return nodes;
}
