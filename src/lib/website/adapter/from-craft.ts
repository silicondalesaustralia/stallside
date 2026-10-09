import type { SerializedNodes } from "@craftjs/core";
import { findStudioCanvasParentId } from "@/lib/studio/page-canvas";
import type { SectionInstance } from "@/lib/website/schema/definition";
import { error, warning, type Diagnostic } from "@/lib/website/schema/diagnostics";
import { sectionDefinition, vendlTypeForCraftName } from "@/lib/website/sections/registry";

type CraftNode = SerializedNodes[string];

function nodeName(node: CraftNode | undefined): string | undefined {
  if (!node) return undefined;
  return typeof node.type === "string" ? node.type : node.type?.resolvedName;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function visibilityOf(node: CraftNode): SectionInstance["visibility"] {
  if ((node as { hidden?: boolean }).hidden === true) return "hidden";
  return asRecord(node.custom).visibility === "EDITOR_ONLY" ? "editorOnly" : "public";
}

/** Converts one Craft node into a section; unmodelled props go to `extras`, never dropped. */
export function craftNodeToSection(
  id: string,
  node: CraftNode,
  path: string,
): { section: SectionInstance; diagnostics: Diagnostic[] } {
  const name = nodeName(node) ?? "";
  const type = vendlTypeForCraftName(name);
  const diagnostics: Diagnostic[] = [];
  const props = asRecord(node.props);
  const custom = asRecord(node.custom);
  const base = {
    id,
    visibility: visibilityOf(node),
    ...(Object.keys(custom).length > 0 ? { editorMeta: custom } : {}),
  };
  if (!type) {
    diagnostics.push(error(path, `Unknown section "${name || "untyped"}" kept as-is; it can't be edited or shown.`));
    return {
      section: { ...base, type: name || "unknown", schemaVersion: 1, variant: "default", content: {}, settings: {}, extras: props },
      diagnostics,
    };
  }
  const def = sectionDefinition(type);
  const contentKeys = new Set(Object.keys(def.content.shape));
  const settingKeys = new Set(Object.keys(def.settings.shape));
  const bindingKeys = new Set(Object.keys(def.binding?.shape ?? {}));
  const content: Record<string, unknown> = {};
  const settings: Record<string, unknown> = {};
  const binding: Record<string, unknown> = {};
  const extras: Record<string, unknown> = {};
  let variant: string | undefined;
  for (const [key, value] of Object.entries(props)) {
    if (key === def.variantProp) variant = String(value);
    else if (key === def.legacyVariantProp && props[def.variantProp ?? ""] === undefined) variant = String(value);
    else if (contentKeys.has(key)) content[key] = value;
    else if (settingKeys.has(key)) settings[key] = value;
    else if (bindingKeys.has(key)) binding[key] = value;
    else extras[key] = value;
  }
  if (Object.keys(extras).length > 0) {
    diagnostics.push(warning(path, `Kept unmodelled field(s) on ${def.label}: ${Object.keys(extras).join(", ")}.`));
  }
  if (node.nodes?.length || Object.keys(asRecord(node.linkedNodes)).length > 0) {
    diagnostics.push(error(path, `${def.label} contains nested content, which isn't supported. Nothing was flattened.`));
  }
  return {
    section: {
      ...base,
      type,
      schemaVersion: def.version,
      variant: variant ?? def.defaultVariant,
      content,
      settings,
      ...(def.binding ? { binding } : {}),
      ...(Object.keys(extras).length > 0 ? { extras } : {}),
    },
    diagnostics,
  };
}

/** Ordered sections of a Craft page. Orphan nodes are reported, not silently ignored. */
export function craftPageToSections(
  nodes: SerializedNodes,
  path: string,
): { sections: SectionInstance[]; diagnostics: Diagnostic[] } {
  const canvasId = findStudioCanvasParentId(nodes);
  const order = nodes[canvasId]?.nodes ?? [];
  const sections: SectionInstance[] = [];
  const diagnostics: Diagnostic[] = [];
  order.forEach((id, i) => {
    const node = nodes[id];
    if (!node) {
      diagnostics.push(error(`${path}.sections.${i}`, `Section "${id}" is listed but missing.`));
      return;
    }
    const converted = craftNodeToSection(id, node, `${path}.sections.${i}`);
    sections.push(converted.section);
    diagnostics.push(...converted.diagnostics);
  });
  const structural = new Set(["ROOT", canvasId, ...order]);
  const orphans = Object.keys(nodes).filter((id) => !structural.has(id));
  if (orphans.length > 0) {
    diagnostics.push(warning(path, `${orphans.length} node(s) not attached to the page were ignored by the renderer.`));
  }
  return { sections, diagnostics };
}
