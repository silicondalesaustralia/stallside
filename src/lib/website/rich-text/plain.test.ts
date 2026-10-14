import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { richTextToPlain, richTextToPlainOrNull } from "./plain";

describe("richTextToPlain", () => {
  it("leaves old plain descriptions unchanged", () => {
    assert.equal(richTextToPlain("Free range eggs, laid daily"), "Free range eggs, laid daily");
  });

  it("drops formatting marks and link targets", () => {
    assert.equal(richTextToPlain("**Big** _brown_ eggs. [Recipes](https://x.com)"), "Big brown eggs. Recipes");
  });

  it("keeps paragraphs and turns lists into bullet lines", () => {
    assert.equal(richTextToPlain("Intro\n\n- One\n- Two\n\n1. A\n2. B"), "Intro\n\n• One\n• Two\n\n1. A\n2. B");
  });

  it("returns null for empty input", () => {
    assert.equal(richTextToPlainOrNull("  "), null);
    assert.equal(richTextToPlainOrNull(null), null);
  });
});
