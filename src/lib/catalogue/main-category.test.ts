import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pickMainCategory, productRelativePath } from "./main-category";

const cats = [
  { id: "a", slug: "veg", showOnWebsite: true },
  { id: "b", slug: "hidden", showOnWebsite: false },
  { id: "c", slug: "eggs", showOnWebsite: true },
];

describe("pickMainCategory", () => {
  it("uses the chosen primary when it is linked and live", () => {
    assert.equal(pickMainCategory("c", new Set(["a", "c"]), cats)?.slug, "eggs");
    assert.equal(pickMainCategory("b", new Set(["b", "c"]), cats)?.slug, "hidden");
  });

  it("falls back to site order, preferring categories shown on the website", () => {
    assert.equal(pickMainCategory(null, new Set(["b", "c"]), cats)?.slug, "eggs");
    assert.equal(pickMainCategory("c", new Set(["a"]), cats)?.slug, "veg");
    assert.equal(pickMainCategory("gone", new Set(["b"]), cats)?.slug, "hidden");
  });

  it("returns nothing for an uncategorised product", () => {
    assert.equal(pickMainCategory("a", new Set(), cats), undefined);
  });
});

describe("productRelativePath", () => {
  it("nests under the category, else /products/", () => {
    assert.equal(productRelativePath("dozen-eggs", "eggs"), "/eggs/dozen-eggs");
    assert.equal(productRelativePath("dozen-eggs", null), "/products/dozen-eggs");
  });
});
