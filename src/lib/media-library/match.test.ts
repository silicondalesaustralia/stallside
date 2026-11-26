import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { matchProductForFileName, mediaMatchKey } from "./match";

describe("media library match", () => {
  it("normalises filenames and product names", () => {
    assert.equal(mediaMatchKey("Free Range Eggs.JPG"), "free-range-eggs");
    assert.equal(mediaMatchKey("free_range_eggs"), "free-range-eggs");
  });

  it("matches slug, sku, then name", () => {
    const products = [
      { id: "1", name: "Dozen eggs", slug: "free-range-eggs", sku: "EGG-12" },
      { id: "2", name: "Rye loaf", slug: "rye-loaf", sku: null },
    ];
    assert.equal(matchProductForFileName("free-range-eggs.jpg", products)?.id, "1");
    assert.equal(matchProductForFileName("EGG-12.png", products)?.id, "1");
    assert.equal(matchProductForFileName("rye loaf.webp", products)?.id, "2");
    assert.equal(matchProductForFileName("unknown.jpg", products), null);
  });
});
