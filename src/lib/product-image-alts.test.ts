import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PRODUCT_IMAGE_ALT_MAX, imageAltList, parseImageAlts, photoAlt, withImageAlt } from "./product-image-alts";

describe("product image alt text", () => {
  it("ignores malformed saved values", () => {
    assert.deepEqual(parseImageAlts(null), {});
    assert.deepEqual(parseImageAlts(["a"]), {});
    assert.deepEqual(parseImageAlts({ a: "  Eggs  ", b: 3, c: " " }), { a: "Eggs" });
  });

  it("sets, clears and prunes alt text for removed photos", () => {
    const photos = ["a", "b"];
    const set = withImageAlt({ gone: "old", b: "Basket" }, photos, "a", " Carton ");
    assert.deepEqual(set, { a: "Carton", b: "Basket" });
    assert.deepEqual(withImageAlt(set, photos, "a", ""), { b: "Basket" });
    assert.equal(withImageAlt({}, photos, "a", "x".repeat(400)).a?.length, PRODUCT_IMAGE_ALT_MAX);
  });

  it("falls back to the product name", () => {
    const alts = imageAltList(["a", "b", "c"], { b: "Basket" });
    assert.deepEqual(alts, ["", "Basket", ""]);
    assert.equal(photoAlt("Eggs", alts, 0), "Eggs");
    assert.equal(photoAlt("Eggs", alts, 1), "Basket");
    assert.equal(photoAlt("Eggs", alts, 2), "Eggs, photo 3");
  });
});
