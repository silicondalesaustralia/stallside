import { describe, expect, it } from "vitest";
import { matchMaterial } from "./match";

const materials = [
  { id: "flour", name: "Bread flour", supplier: "Bakers Supply" },
  { id: "choc", name: "Dark chocolate chips", supplier: null },
  { id: "butter", name: "Butter", supplier: null },
];

describe("matchMaterial", () => {
  it("matches on the material's words appearing in the line", () => {
    expect(matchMaterial("Laucke Bread Flour 12.5kg", null, materials)).toBe("flour");
    expect(matchMaterial("Callebaut dark choc chips 2.5KG", null, materials)).toBe("choc");
    expect(matchMaterial("Dark Chocolate Chips 1kg x2", null, materials)).toBe("choc");
    expect(matchMaterial("Unsalted butter 500g", null, materials)).toBe("butter");
  });

  it("returns null for unrelated lines", () => {
    expect(matchMaterial("Delivery fee", null, materials)).toBe(null);
  });
});
