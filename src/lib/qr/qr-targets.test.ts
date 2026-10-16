import { test } from "node:test";
import assert from "node:assert/strict";
import { legacyQrTarget, parseQrTarget, qrTargetKey, withStallFlag } from "./target-types";
import { qrTargetPath } from "./target-path";
import type { StorefrontCustomPage } from "@/lib/studio/custom-pages";

test("targets need an id only for things that can be renamed or removed", () => {
  assert.deepEqual(parseQrTarget("home", "x"), { kind: "home", id: null });
  assert.deepEqual(parseQrTarget("product", " p1 "), { kind: "product", id: "p1" });
  assert.equal(parseQrTarget("product", ""), null);
  assert.equal(parseQrTarget("nope", "x"), null);
});

test("older QR rows keep opening the same place", () => {
  assert.deepEqual(legacyQrTarget("WEBSITE_HOME", null), { kind: "home", id: null });
  assert.deepEqual(legacyQrTarget("WEBSITE_CATEGORY", "c1"), { kind: "category", id: "c1" });
  assert.deepEqual(legacyQrTarget("WEBSITE_CATEGORY", null), { kind: "home", id: null });
});

test("paths match the website routes old stall links redirect to", () => {
  assert.equal(qrTargetPath({ kind: "home" }), "/");
  assert.equal(qrTargetPath({ kind: "cart" }), "/cart");
  assert.equal(qrTargetPath({ kind: "category", slug: "Farm-Stand" }), "/farm-stand");
  assert.equal(qrTargetPath({ kind: "product", slug: "eggs" }), "/products/eggs");
  assert.equal(qrTargetPath({ kind: "preorder_page", slug: "xmas" }), "/pre-orders/xmas");
  assert.equal(qrTargetPath({ kind: "menu", slug: "bread", drop: true }), "/pre-orders/bread");
  assert.equal(qrTargetPath({ kind: "menu", slug: "bread", drop: false }), "/menus/bread");
  const page = { id: "p", slug: "our-farm", routeKind: "custom" } as StorefrontCustomPage;
  assert.equal(qrTargetPath({ kind: "page", page }), "/our-farm");
  const about = { id: "a", slug: "about", routeKind: "builtin", builtinKey: "about" } as StorefrontCustomPage;
  assert.equal(qrTargetPath({ kind: "page", page: about }), "/about");
});

test("stall flag and keys", () => {
  assert.equal(withStallFlag("https://x.test/"), "https://x.test/?at=stall");
  assert.equal(withStallFlag("https://x.test/?a=1"), "https://x.test/?a=1&at=stall");
  assert.equal(qrTargetKey({ kind: "home", id: null }), "home:");
});
