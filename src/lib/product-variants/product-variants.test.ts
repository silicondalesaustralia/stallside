import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveCartVariant, variantStockShort } from "./cart-variant";
import { parseVariantsInput } from "./parse-variants-input";
import { buildCombinations } from "./variant-draft";
import { joinSnapshots, variantSnapshot } from "./variant-title";

const names = { option1Name: "Size", option2Name: "Colour", option3Name: null };
const large = { id: "v1", option1: "Large", option2: "Red", option3: null, priceCents: 900, stockQuantity: 2 };
const product = { ...names, variants: [large] };

describe("product variants", () => {
  it("snapshots variant and add-on text for order lines", () => {
    assert.equal(variantSnapshot(names, large), "Size: Large · Colour: Red");
    assert.equal(joinSnapshots("Size: Large", "Gift wrap: Yes"), "Size: Large · Gift wrap: Yes");
    assert.equal(joinSnapshots(null, null), null);
  });

  it("requires a valid variant when a product has variants", () => {
    assert.deepEqual(resolveCartVariant(product, "v1"), { variant: large });
    assert.ok("error" in resolveCartVariant(product, null));
    assert.ok("error" in resolveCartVariant(product, "nope"));
    assert.ok("error" in resolveCartVariant({ ...names, variants: [] }, "v1"));
  });

  it("checks stock per variant across cart lines", () => {
    const byId = new Map([["p1", product]]);
    const line = { productId: "p1", variantId: "v1", quantity: 1 };
    assert.equal(variantStockShort([line, line], byId), false);
    assert.equal(variantStockShort([line, line, line], byId), true);
  });

  it("builds combinations and keeps existing rows", () => {
    const rows = buildCombinations(
      [{ name: "Size", values: "S, M" }, { name: "Colour", values: "Red" }],
      [{ values: ["M", "Red"], price: "12.00", sku: "M-R", stock: "4" }],
      "10.00",
    );
    assert.deepEqual(rows.map((r) => [r.values.join("/"), r.price, r.stock]), [
      ["S/Red", "10.00", "0"],
      ["M/Red", "12.00", "4"],
    ]);
  });

  it("rejects duplicate variants and missing values", () => {
    const base = { sku: null, priceCents: 100, stockQuantity: 1 };
    const dup = parseVariantsInput({
      optionNames: ["Size"],
      variants: [{ ...base, values: ["S"] }, { ...base, values: ["s"] }],
    });
    assert.equal(dup.ok, false);
    const short = parseVariantsInput({ optionNames: ["Size", "Colour"], variants: [{ ...base, values: ["S"] }] });
    assert.equal(short.ok, false);
  });
});
