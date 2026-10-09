import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  listWebsiteBlueprints,
  recommendWebsiteBlueprint,
  resolveBlueprintChoice,
  WEBSITE_BLUEPRINT_IDS,
  getWebsiteBlueprint,
  assertBlueprintDistinctness,
} from "@/lib/website/blueprints";
import { planSiteHeuristic } from "@/lib/website-ai/heuristic-planner";
import { validateAiSitePlan } from "@/lib/website-ai/validate-plan";
import type { WebsiteBusinessContext } from "@/lib/website-ai/types";

function sampleCtx(
  overrides: Partial<WebsiteBusinessContext> = {},
): WebsiteBusinessContext {
  return {
    ownerId: "owner_1",
    businessMode: "BOTH",
    businessName: "Green Valley",
    headline: "Green Valley Farm",
    subheadline: "Fresh from our fields",
    about: "Family farm.",
    regionLabel: "Adelaide Hills",
    hasFarmStand: true,
    hasMenus: true,
    hasDelivery: false,
    hasPickup: true,
    productCount: 4,
    categoryCount: 2,
    reviewCount: 3,
    categories: [{ id: "1", title: "Veg", slug: "veg" }],
    featuredProducts: [{ id: "p1", title: "Kale" }],
    productPhotoCount: 2,
    logoUrl: null,
    heroImageUrl: null,
    accentColor: null,
    secondaryColor: null,
    existingTemplateId: null,
    hasExistingStudio: false,
    ...overrides,
  };
}

describe("website blueprints", () => {
  it("registers all 10 starting styles", () => {
    assert.equal(listWebsiteBlueprints().length, 10);
    assert.equal(WEBSITE_BLUEPRINT_IDS.length, 10);
  });

  it("includes layout, brandKit, cardDescription and about-safe metadata", () => {
    assert.doesNotThrow(() => assertBlueprintDistinctness());
    for (const bp of listWebsiteBlueprints()) {
      assert.ok(bp.layout.hero);
      assert.ok(bp.brandKit.palette.primary);
      assert.ok(bp.cardDescription.length <= 50);
      assert.equal(bp.layoutTags.length, 3);
      assert.ok(bp.assetNeeds.minPhotos >= 0);
    }
  });

  it("recommends Local for farm stand sellers", () => {
    const rec = recommendWebsiteBlueprint(sampleCtx({ hasFarmStand: true }));
    assert.equal(rec.recommendedBlueprintId, "local");
    assert.ok(rec.reasonCodes.includes("LOCAL_PHYSICAL_SELLING"));
  });

  it("recommends Catalogue for large ranges", () => {
    const rec = recommendWebsiteBlueprint(
      sampleCtx({ hasFarmStand: false, productCount: 40, categoryCount: 8 }),
    );
    assert.equal(rec.recommendedBlueprintId, "catalogue");
  });

  it("falls back to Modern Store for general ecommerce", () => {
    const rec = recommendWebsiteBlueprint(
      sampleCtx({
        hasFarmStand: false,
        hasMenus: false,
        productCount: 5,
        categoryCount: 1,
        about: null,
        productPhotoCount: 0,
      }),
    );
    assert.equal(rec.recommendedBlueprintId, "modern-store");
  });

  it("respects explicit seller blueprint override", () => {
    const rec = recommendWebsiteBlueprint(sampleCtx({ productCount: 40, categoryCount: 8 }));
    const chosen = resolveBlueprintChoice("editorial", rec);
    assert.equal(chosen.blueprintId, "editorial");
    assert.equal(chosen.fromAiDefault, false);
  });

  it("plans distinct home compositions for different blueprints", () => {
    const ctx = sampleCtx({ hasFarmStand: false });
    const editorial = planSiteHeuristic({
      businessContext: ctx,
      intent: { blueprintId: "editorial", selectedPages: ["HOME", "ABOUT", "SHOP"] },
    });
    const catalogue = planSiteHeuristic({
      businessContext: ctx,
      intent: { blueprintId: "catalogue", selectedPages: ["HOME", "ABOUT", "SHOP"] },
    });
    assert.equal(editorial.ok, true);
    assert.equal(catalogue.ok, true);
    if (!editorial.ok || !catalogue.ok) return;
    assert.equal(editorial.plan.designSystem, getWebsiteBlueprint("editorial").designSystem);
    assert.equal(catalogue.plan.designSystem, getWebsiteBlueprint("catalogue").designSystem);
    const eHome = editorial.plan.pages.find((p) => p.pageType === "HOME")!;
    const cHome = catalogue.plan.pages.find((p) => p.pageType === "HOME")!;
    assert.notDeepEqual(
      eHome.sections.map((s) => s.type),
      cHome.sections.map((s) => s.type),
    );
    assert.equal(validateAiSitePlan(editorial.plan, ctx).ok, true);
    assert.equal(validateAiSitePlan(catalogue.plan, ctx).ok, true);
  });
});
