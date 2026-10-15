import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buttonWidthOf, productButtonsOf, toggleProductButton } from "@/lib/studio/product-buttons";

describe("product buy buttons", () => {
  it("shows both by default and ignores unknown values", () => {
    assert.equal(productButtonsOf(undefined), "both");
    assert.equal(productButtonsOf("none"), "both");
  });

  it("never turns off the last visible button", () => {
    assert.equal(toggleProductButton("both", "cart", false), "checkout");
    assert.equal(toggleProductButton("checkout", "checkout", false), "checkout");
    assert.equal(toggleProductButton("cart", "checkout", true), "both");
  });

  it("clamps the width and treats missing as standard", () => {
    assert.equal(buttonWidthOf(undefined), null);
    assert.equal(buttonWidthOf(5), 30);
    assert.equal(buttonWidthOf(140), 100);
  });
});
