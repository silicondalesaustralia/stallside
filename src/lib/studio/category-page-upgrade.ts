import type { SerializedNodes } from "@craftjs/core";

/** Body text of the placeholder section the old category starter shipped with. */
const OLD_STARTER_BODY =
  "Products in this category appear below. The heading updates from the live category name when published.";

type Node = SerializedNodes[string];

function nameOf(node: Node | undefined): string | undefined {
  if (!node) return undefined;
  return typeof node.type === "string" ? node.type : node.type?.resolvedName;
}

/**
 * Category layouts saved from the old starter (placeholder text + "In this category" grid)
 * become one Category page section, keeping the grid's columns and the text's style.
 * Layouts the seller changed away from the starter are returned untouched.
 */
export function upgradeCategoryPageNodes(nodes: SerializedNodes): SerializedNodes {
  const ids = Object.keys(nodes);
  if (ids.some((id) => nameOf(nodes[id]) === "CraftCategoryDetailSection")) return nodes;
  const textId = ids.find(
    (id) => nameOf(nodes[id]) === "CraftTextSection" && nodes[id].props?.body === OLD_STARTER_BODY,
  );
  if (!textId) return nodes;
  const text = nodes[textId];
  const parentId = text.parent ?? undefined;
  const gridId = ids.find(
    (id) =>
      nameOf(nodes[id]) === "CraftProductGridSection" &&
      nodes[id].props?.source === "activeCategory" &&
      nodes[id].parent === parentId,
  );
  const grid = gridId ? nodes[gridId] : undefined;
  const columns = [2, 3, 4].includes(Number(grid?.props?.columns)) ? Number(grid?.props?.columns) : 3;

  const next: SerializedNodes = { ...nodes };
  next[textId] = {
    ...text,
    type: { resolvedName: "CraftCategoryDetailSection" },
    displayName: "CraftCategoryDetailSection",
    isCanvas: false,
    nodes: [],
    linkedNodes: {},
    props: {
      showTitle: true,
      showTopDescription: true,
      showBottomDescription: true,
      columns,
      showPrice: grid?.props?.showPrice !== false,
      showAvailability: grid?.props?.showAvailability !== false,
      ...(text.props?.style ? { style: text.props.style } : {}),
    },
  };
  if (gridId) {
    delete next[gridId];
    const parent = parentId ? next[parentId] : undefined;
    if (parentId && parent) {
      next[parentId] = { ...parent, nodes: parent.nodes.filter((id) => id !== gridId) };
    }
  }
  return next;
}
