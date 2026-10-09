import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  proposeBrandLooks,
  getLookCombo,
  getPalette,
  getFontPair,
  listFontPairs,
  pickFontForMode,
} from "./brand-looks";
import { applyLookToPlan } from "@/lib/website-ai/apply-look";
import { WEBSITE_AI_SPEC_VERSION } from "@/lib/website-ai/types";

const emptyPlan = {
  version: WEBSITE_AI_SPEC_VERSION,
  designSystem: "market" as const,
  siteStrategy: {
    primaryGoal: "sell",
    audienceSummary: "locals",
    contentPriorities: [] as string[],
  },
  navigation: [],
  pages: [],
};

describe("brand looks", () => {
  it("proposes exactly three looks with font pairs", () => {
    const looks = proposeBrandLooks({
      stylePreference: "warm-local",
      businessMode: "FARM_STAND",
    });
    assert.equal(looks.length, 3);
    assert.ok(looks.every((l) => getPalette(l.paletteId)));
    assert.ok(looks.every((l) => getFontPair(l.fontPairId)));
  });

  it("exposes many curated font pairs", () => {
    assert.ok(listFontPairs().length >= 12);
  });

  it("recommends bold fonts for energetic style", () => {
    assert.equal(pickFontForMode("BOTH", "bold-energetic"), "bold-syne");
  });

  it("leads with seller colours when seeds are set", () => {
    const looks = proposeBrandLooks({
      seedAccent: "#6b2d45",
      seedSecondary: "#c4785a",
      hasLogo: true,
      businessMode: "FOOD_BUSINESS",
    });
    assert.equal(looks.length, 3);
    assert.equal(looks[0]?.id, "your-colours");
    assert.equal(looks[0]?.accentOverride, "#6b2d45");
    assert.ok(getFontPair(looks[0]!.fontPairId));
    const applied = applyLookToPlan(emptyPlan, "your-colours", looks);
    assert.ok(applied);
    assert.equal(applied.themeOverrides?.accentColor, "#6b2d45");
    assert.equal(applied.themeOverrides?.paletteId, "custom");
    assert.equal(applied.themeOverrides?.fontPairId, looks[0]!.fontPairId);
  });

  it("applies catalog look colours and fonts onto theme overrides", () => {
    const look = proposeBrandLooks({})[0]!;
    const applied = applyLookToPlan(emptyPlan, look.id);
    assert.ok(applied);
    assert.equal(applied.plan.designSystem, look.designSystem);
    assert.equal(applied.themeOverrides?.paletteId, look.paletteId);
    assert.equal(applied.themeOverrides?.accentColor, getPalette(look.paletteId)?.accent);
    assert.equal(applied.themeOverrides?.fontPairId, look.fontPairId);
    assert.equal(getLookCombo(look.id)?.id, look.id);
  });

  it("respects an explicit font override on apply", () => {
    const look = proposeBrandLooks({})[0]!;
    const applied = applyLookToPlan(emptyPlan, look.id, undefined, "bold-syne");
    assert.ok(applied);
    assert.equal(applied.themeOverrides?.fontPairId, "bold-syne");
  });
});
