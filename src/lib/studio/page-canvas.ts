import type { SerializedNodes } from "@craftjs/core";
import { ROOT_NODE } from "@craftjs/utils";

const PAGE_ROOT_NAMES = new Set(["CraftPageRoot"]);

function resolvedName(
  node: { type?: { resolvedName?: string } | string } | undefined,
): string | undefined {
  if (!node) return undefined;
  return typeof node.type === "string" ? node.type : node.type?.resolvedName;
}

/** Craft page canvas node — sections live here, not under ROOT directly. */
export function findStudioCanvasParentId(nodes: SerializedNodes): string {
  const root = nodes[ROOT_NODE];
  if (!root?.nodes?.length) return ROOT_NODE;

  for (const childId of root.nodes) {
    const child = nodes[childId];
    const name = resolvedName(child);
    if (name && PAGE_ROOT_NAMES.has(name)) return childId;
    if (child && "isCanvas" in child && child.isCanvas) return childId;
  }

  return root.nodes[root.nodes.length - 1] ?? ROOT_NODE;
}

export function studioSectionInsertIndex(
  nodes: SerializedNodes,
  parentId = findStudioCanvasParentId(nodes),
): number {
  return nodes[parentId]?.nodes?.length ?? 0;
}

export function studioEditorReady(nodes: SerializedNodes): boolean {
  return Boolean(nodes[ROOT_NODE]);
}
