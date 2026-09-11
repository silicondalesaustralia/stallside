import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { planSiteHeuristic } from "./heuristic-planner";
import { validateAiSitePlan } from "./validate-plan";
import { compilePlanToStudioPayload } from "./compile-nodes";
import { assessWebsiteContext } from "./assess-context";
import { computeMissingInformation } from "./missing-info";
import type { WebsiteBusinessContext } from "./types";

function sampleCtx(
  overrides: Partial<WebsiteBusinessContext> = {},
): WebsiteBusinessContext {
  return {
    ownerId: "owner_1",
    businessMode: "BOTH",
    businessName: "Green Valley Farm & Bakes",
    headline: "Green Valley Farm & Bakes",
    subheadline: "Farm stand eggs and weekly sourdough",
    about: "We grow and bake for our local community.",
    regionLabel: "Adelaide Hills",
    hasFarmStand: true,
    hasMenus: true,
    hasDelivery: true,
    hasPickup: true,
    productCount: 12,
    categoryCount: 4,
    reviewCount: 3,
    categories: [{ id: "c1", title: "Eggs", slug: "eggs" }],
    featuredProducts: [{ id: "p1", title: "Farm eggs" }],
    productPhotoCount: 1,
    logoUrl: null,
    heroImageUrl: null,
    accentColor: null,
    secondaryColor: null,
    existingTemplateId: null,
    hasExistingStudio: false,
    ...overrides,
  };
}

describe("website-ai heuristic planner", () => {
  it("builds a valid BOTH-mode homepage plan", () => {
    const result = planSiteHeuristic({ businessContext: sampleCtx() });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const validated = validateAiSitePlan(result.plan, sampleCtx());
    assert.equal(validated.ok, true);
    const compiled = compilePlanToStudioPayload(result.plan);
    assert.equal(compiled.errors.length, 0);
    assert.ok(compiled.payload);
    assert.ok(compiled.payload.nodes.ROOT);
    assert.equal(compiled.payload.engine, "craft");
  });

  it("omits FarmStand for FOOD_BUSINESS", () => {
    const ctx = sampleCtx({
      businessMode: "FOOD_BUSINESS",
      hasFarmStand: false,
      hasMenus: true,
    });
    const result = planSiteHeuristic({ businessContext: ctx });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const types = result.plan.pages[0]!.sections.map((s) => s.type);
    assert.equal(types.includes("FarmStand"), false);
    assert.equal(validateAiSitePlan(result.plan, ctx).ok, true);
  });

  it("does not invent about copy when missing", () => {
    const ctx = sampleCtx({ about: null });
    const result = planSiteHeuristic({ businessContext: ctx });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const story = result.plan.pages[0]!.sections.find((s) => s.type === "ImageText");
    assert.ok(story?.body);
    assert.equal(/three generations|organic|award/i.test(story!.body!), false);
    assert.equal(story!.copyKind, "INSTRUCTIONAL");
    const missing = computeMissingInformation(ctx, {});
    assert.ok(missing.some((m) => m.id === "NO_ABOUT"));
  });

  it("respects selected capabilities and sample products", () => {
    const ctx = sampleCtx({ productCount: 0, featuredProducts: [] });
    const result = planSiteHeuristic({
      businessContext: ctx,
      intent: {
        selectedPages: ["HOME", "ABOUT", "CONTACT", "FAQ", "SHOP"],
        selectedCapabilities: ["SHOP", "NEWSLETTER"],
        includeSampleProducts: true,
      },
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const grid = result.plan.pages[0]!.sections.find((s) => s.type === "ProductGrid");
    assert.ok(grid);
    assert.equal(grid!.productPresentation, "SAMPLE");
    assert.equal(grid!.visibility, "EDITOR_ONLY");
    assert.ok(result.plan.pages.some((p) => p.pageType === "ABOUT"));
  });

  it("assesses site-shape mode for sparse sellers", () => {
    const assessment = assessWebsiteContext(
      sampleCtx({
        productCount: 0,
        categoryCount: 0,
        reviewCount: 0,
        hasFarmStand: false,
        hasMenus: false,
        hasDelivery: false,
        hasPickup: false,
        about: null,
        regionLabel: null,
        featuredProducts: [],
        categories: [],
        productPhotoCount: 0,
      }),
    );
    assert.equal(assessment.readiness, "SPARSE");
    assert.equal(assessment.siteShapeMode, "expanded");
    assert.ok(assessment.pageOptions.some((p) => p.id === "HOME" && p.disabled));
  });
});
