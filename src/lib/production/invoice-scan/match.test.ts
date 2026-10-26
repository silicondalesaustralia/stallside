import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { matchMaterial } from "./match";

const materials = [
  { id: "flour", name: "Bread flour", supplier: "Bakers Supply" },
  { id: "choc", name: "Dark chocolate chips", supplier: null },
  { id: "butter", name: "Butter", supplier: null },
];

describe("matchMaterial", () => {
  it("matches on the material's words appearing in the line", () => {
    assert.equal(matchMaterial("Laucke Bread Flour 12.5kg", null, materials), "flour");
    assert.equal(matchMaterial("Callebaut dark choc chips 2.5KG", null, materials), "choc");
    assert.equal(matchMaterial("Dark Chocolate Chips 1kg x2", null, materials), "choc");
    assert.equal(matchMaterial("Unsalted butter 500g", null, materials), "butter");
  });

  it("returns null for unrelated lines", () => {
    assert.equal(matchMaterial("Delivery fee", null, materials), null);
  });
});
