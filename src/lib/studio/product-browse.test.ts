import { test } from "node:test";
import assert from "node:assert/strict";
import { NO_FILTERS, browseProducts, priceBounds, sortProducts, type BrowseProduct } from "./product-browse";

const p = (id: string, priceCents: number, extra: Partial<BrowseProduct> = {}): BrowseProduct => ({
  id,
  name: id,
  priceCents,
  soldOut: false,
  categoryIds: [],
  ...extra,
});

const items = [
  p("a", 500, { createdAtMs: 1, categoryIds: ["eggs"] }),
  p("b", 900, { createdAtMs: 3, compareAtPriceCents: 1200, rating: { average: 4.5, count: 2 } }),
  p("c", 300, { createdAtMs: 2, soldOut: true, compareAtPriceCents: 350, categoryIds: ["eggs"] }),
];

test("featured keeps the seller's order", () => {
  assert.deepEqual(sortProducts(items, "featured").map((x) => x.id), ["a", "b", "c"]);
});

test("price, newest and sale sorts", () => {
  assert.deepEqual(sortProducts(items, "price-asc").map((x) => x.id), ["c", "a", "b"]);
  assert.deepEqual(sortProducts(items, "price-desc").map((x) => x.id), ["b", "a", "c"]);
  assert.deepEqual(sortProducts(items, "newest").map((x) => x.id), ["b", "c", "a"]);
  assert.deepEqual(sortProducts(items, "sale").map((x) => x.id), ["b", "c", "a"]);
});

test("filters combine", () => {
  const ids = (f: Partial<typeof NO_FILTERS>) => browseProducts(items, { ...NO_FILTERS, ...f }, "featured").map((x) => x.id);
  assert.deepEqual(ids({ categoryIds: ["eggs"] }), ["a", "c"]);
  assert.deepEqual(ids({ inStock: true }), ["a", "b"]);
  assert.deepEqual(ids({ onSale: true }), ["b", "c"]);
  assert.deepEqual(ids({ minRating: 4 }), ["b"]);
  assert.deepEqual(ids({ minCents: 400, maxCents: 900 }), ["a", "b"]);
});

test("price bounds round out to whole units", () => {
  assert.deepEqual(priceBounds(items), { min: 300, max: 900 });
  assert.deepEqual(priceBounds([p("x", 450), p("y", 1250)]), { min: 400, max: 1300 });
});
