import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { proposeBrandLooks, getLookCombo, getPalette } from "./brand-looks";
import { applyLookToPlan } from "@/lib/website-ai/apply-look";
import { WEBSITE_AI_SPEC_VERSION } from "@/lib/website-ai/types";

describe("brand looks", () => {
  it("proposes exactly three looks", () => {
    const looks = proposeBrandLooks({
      stylePreference: "warm-local",
      businessMode: "FARM_STAND",
    });
    assert.equal(looks.length, 3);
    assert.ok(looks.every((l) => getPalette(l.paletteId)));
  });

  it("applies look colours onto theme overrides", () => {
    const look = proposeBrandLooks({})[0]!;
    const applied = applyLookToPlan(
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
      look.id,
    );
    assert.ok(applied);
    assert.equal(applied.plan.designSystem, look.designSystem);
    assert.equal(applied.themeOverrides?.paletteId, look.paletteId);
    assert.equal(applied.themeOverrides?.accentColor, getPalette(look.paletteId)?.accent);
    assert.equal(getLookCombo(look.id)?.id, look.id);
  });
});
