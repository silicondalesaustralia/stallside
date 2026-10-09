import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { templatePackagesFor } from "./packages";
import { goalsFor, parseCustomerGoal, rankTemplatePackages } from "./recommend";

describe("customer goal recommendations", () => {
  it("only offers weekly releases to food businesses", () => {
    assert.ok(!goalsFor("FARM_STAND").some((g) => g.id === "release"));
    assert.ok(goalsFor("FOOD_BUSINESS").some((g) => g.id === "release"));
    assert.equal(parseCustomerGoal("release", "FARM_STAND"), null);
    assert.equal(parseCustomerGoal("nonsense", "BOTH"), null);
  });

  it("ranks the best layout first", () => {
    const pkgs = templatePackagesFor("BOTH");
    assert.equal(rankTemplatePackages(pkgs, "release")[0].id, "weekly-release");
    assert.equal(rankTemplatePackages(pkgs, "enquire")[0].id, "story-first");
    assert.equal(rankTemplatePackages(pkgs, "shop")[0].id, "product-first");
  });

  it("skips layouts that don't suit the business mode", () => {
    const ranked = rankTemplatePackages(templatePackagesFor("FARM_STAND"), "subscribe");
    assert.ok(!ranked.some((p) => p.id === "weekly-release"));
    assert.equal(ranked[0].id, "product-first");
  });

  it("keeps the default order without a goal", () => {
    const pkgs = templatePackagesFor("BOTH");
    assert.deepEqual(rankTemplatePackages(pkgs, null), pkgs);
  });
});
