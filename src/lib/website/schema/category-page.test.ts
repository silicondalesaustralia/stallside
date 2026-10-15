import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SerializedNodes } from "@craftjs/core";
import { upgradeCategoryPageNodes } from "@/lib/studio/category-page-upgrade";
import { categoryDetailView, categoryGridClass } from "@/lib/studio/category-detail-settings";

function node(name: string, props: Record<string, unknown>, parent: string | null, nodes: string[] = []) {
  return {
    type: { resolvedName: name },
    isCanvas: nodes.length > 0,
    props,
    displayName: name,
    custom: {},
    hidden: false,
    nodes,
    linkedNodes: {},
    parent,
  };
}

const OLD_BODY =
  "Products in this category appear below. The heading updates from the live category name when published.";

function oldStarter(): SerializedNodes {
  return {
    ROOT: node("StudioPageRoot", {}, null, ["text", "grid"]),
    text: node("CraftTextSection", { heading: "Category", body: OLD_BODY, style: { background: "wash" } }, "ROOT"),
    grid: node("CraftProductGridSection", { source: "activeCategory", columns: 4, showPrice: false }, "ROOT"),
  } as SerializedNodes;
}

describe("category page", () => {
  it("swaps the old starter placeholder and grid for one Category page section", () => {
    const out = upgradeCategoryPageNodes(oldStarter());
    assert.deepEqual(out.ROOT.nodes, ["text"]);
    assert.equal(out.grid, undefined);
    assert.deepEqual(out.text.type, { resolvedName: "CraftCategoryDetailSection" });
    assert.equal(out.text.props.columns, 4);
    assert.equal(out.text.props.showPrice, false);
    assert.deepEqual(out.text.props.style, { background: "wash" });
  });

  it("leaves layouts the seller changed untouched", () => {
    const edited = oldStarter();
    edited.text = { ...edited.text, props: { ...edited.text.props, body: "Our eggs" } };
    assert.equal(upgradeCategoryPageNodes(edited), edited);
  });

  it("defaults every option on and builds the grid classes", () => {
    const view = categoryDetailView({});
    assert.equal(view.showTitle && view.showTopDescription && view.showBottomDescription, true);
    assert.equal(categoryGridClass(view), "grid-cols-2 sf-md:grid-cols-3");
    assert.equal(categoryGridClass(categoryDetailView({ columns: 9, mobileColumns: 1 })), "grid-cols-1 sf-md:grid-cols-3");
  });
});
