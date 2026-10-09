import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyBlueprintBrandToTheme,
  applyBlueprintDesignSystem,
} from "./apply-blueprint-brand";
import { fontPairIdForBlueprint } from "@/lib/website/blueprints/font-pairs";
import { getFontPair } from "@/lib/website/brand-looks";
import { WEBSITE_AI_SPEC_VERSION } from "./types";

describe("applyBlueprintBrand", () => {
  it("maps local brand kit colours and fonts onto theme overrides", () => {
    const next = applyBlueprintBrandToTheme(
      {
        accentColor: "#111111",
        secondaryColor: "#222222",
        paletteId: "orchard-green",
        fontPairId: "orchard-serif",
      },
      "local",
    );
    assert.equal(next.accentColor, "#B8412A");
    assert.equal(next.secondaryColor, "#2F6D4F");
    assert.equal(next.fontPairId, fontPairIdForBlueprint("local"));
    assert.ok(getFontPair(next.fontPairId));
    assert.equal(next.buttonStyle, "pill");
    assert.equal(next.headerLayout, "stacked");
    assert.equal(next.brandMark, "name-only");
  });

  it("seeds logo-only minimal header when blueprint is minimal and logo exists", () => {
    const next = applyBlueprintBrandToTheme({}, "minimal", { hasLogo: true });
    assert.equal(next.headerLayout, "minimal");
    assert.equal(next.brandMark, "logo-only");
  });

  it("restores blueprint design system on the plan", () => {
    const plan = applyBlueprintDesignSystem(
      {
        version: WEBSITE_AI_SPEC_VERSION,
        designSystem: "market",
        siteStrategy: {
          primaryGoal: "sell",
          audienceSummary: "locals",
          contentPriorities: [],
        },
        navigation: [],
        pages: [],
      },
      "editorial",
    );
    assert.equal(plan.designSystem, "artisan");
  });
});
