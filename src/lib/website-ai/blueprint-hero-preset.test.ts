import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { heroPresetFromBlueprintHero } from "./blueprint-hero-preset";

describe("heroPresetFromBlueprintHero", () => {
  it("maps full-bleed styles to background hero", () => {
    assert.equal(heroPresetFromBlueprintHero("FULL_BLEED"), "background");
    assert.equal(heroPresetFromBlueprintHero("TYPE_BLOCK"), "background");
  });

  it("maps split and editorial variants", () => {
    assert.equal(heroPresetFromBlueprintHero("SPLIT_MEDIA"), "split");
    assert.equal(heroPresetFromBlueprintHero("EDITORIAL_STACK"), "editorial");
    assert.equal(heroPresetFromBlueprintHero("FRAMED_INSET"), "minimal");
  });
});
