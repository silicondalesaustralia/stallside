import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_BLOCK_LAYOUT, moveBlock, parseBlockLayout } from "@/lib/studio/product-blocks";
import { productDetailView } from "@/lib/studio/product-detail-settings";

describe("product page block layout", () => {
  it("defaults to every block in the details column", () => {
    assert.deepEqual(parseBlockLayout(undefined), DEFAULT_BLOCK_LAYOUT);
    assert.deepEqual(productDetailView({}).blocks, DEFAULT_BLOCK_LAYOUT);
  });

  it("keeps each block once, drops unknown ids and adds missing blocks to details", () => {
    const layout = parseBlockLayout({ photo: ["infoRows", "bogus", "infoRows"], below: ["tabs", "infoRows"] });
    assert.deepEqual(layout.photo, ["infoRows"]);
    assert.deepEqual(layout.below, ["tabs"]);
    assert.deepEqual(layout.details, ["name", "rating", "price", "description", "buy"]);
  });

  it("puts the rating straight after the name in layouts saved before it existed", () => {
    const layout = parseBlockLayout({ photo: ["name", "price"], details: ["buy", "description"], below: [] });
    assert.deepEqual(layout.photo, ["name", "rating", "price"]);
    assert.deepEqual(layout.details, ["buy", "description", "infoRows", "tabs"]);
    assert.deepEqual(parseBlockLayout({ details: ["rating", "name"] }).details.slice(0, 2), ["rating", "name"]);
  });

  it("moves a block into another zone at the drop position", () => {
    const moved = moveBlock(DEFAULT_BLOCK_LAYOUT, "infoRows", "photo", 0);
    assert.deepEqual(moved.photo, ["infoRows"]);
    assert.ok(!moved.details.includes("infoRows"));
  });

  it("reorders within a zone with the block taken out first", () => {
    const moved = moveBlock(DEFAULT_BLOCK_LAYOUT, "name", "details", 1);
    assert.deepEqual(moved.details.slice(0, 2), ["rating", "name"]);
    assert.deepEqual(moveBlock(DEFAULT_BLOCK_LAYOUT, "tabs", "details", 99).details.at(-1), "tabs");
  });
});
