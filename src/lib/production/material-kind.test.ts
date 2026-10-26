import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { guessMaterialKind } from "./material-kind";

describe("guessMaterialKind", () => {
  it("spots packaging by name", () => {
    assert.equal(guessMaterialKind("Kraft bread bags 100pk"), "PACKAGING");
    assert.equal(guessMaterialKind("Cake box 8in"), "PACKAGING");
    assert.equal(guessMaterialKind("Round labels"), "PACKAGING");
  });

  it("leaves ingredients alone", () => {
    assert.equal(guessMaterialKind("Bread flour 12.5kg"), "INGREDIENT");
    assert.equal(guessMaterialKind("Boxed butter"), "INGREDIENT");
  });
});
