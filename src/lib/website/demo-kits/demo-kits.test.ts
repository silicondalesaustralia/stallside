import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  listDemoKits,
  getDemoKit,
  recommendDemoKit,
  resolveKitText,
  DEMO_KIT_IDS,
} from "@/lib/website/demo-kits";
import { assertBlueprintDistinctness } from "@/lib/website/blueprints";
import {
  assertNoDemoAssets,
  findDemoAssetReferences,
} from "@/lib/website/demo-assets/reject-demo-assets";
import { compilePlanToStudioPayload } from "@/lib/website-ai/compile-nodes";
import { planSiteHeuristic } from "@/lib/website-ai/heuristic-planner";
import type { WebsiteBusinessContext } from "@/lib/website-ai/types";

describe("demo kits", () => {
  it("registers three kits with 12 products and about copy", () => {
    assert.equal(DEMO_KIT_IDS.length, 3);
    assert.equal(listDemoKits().length, 3);
    for (const kit of listDemoKits()) {
      assert.equal(kit.products.length, 12);
      assert.equal(kit.categories.length, 4);
      assert.ok(kit.copy.about.short.includes("{businessName}"));
      assert.ok(kit.copy.about.long.includes("{businessName}"));
      assert.equal(kit.copy.about.pillars.length, 3);
      assert.equal(kit.copy.faq.length, 6);
      assert.equal(kit.copy.reviews.length, 3);
      assert.ok(kit.products.some((p) => p.soldOut));
      assert.ok(kit.products.some((p) => p.variants));
      assert.ok(kit.products.some((p) => p.badge === "NEW"));
      assert.ok(kit.products.some((p) => p.name.length >= 32));
    }
  });

  it("resolves business name in about copy", () => {
    const kit = getDemoKit("green-valley");
    const heading = resolveKitText(kit.copy.about.heading, "Hilltop Eggs");
    assert.equal(heading, "About Hilltop Eggs");
    assert.ok(!heading.includes("{businessName}"));
  });

  it("recommends kit from business signals", () => {
    assert.equal(recommendDemoKit({ hasFarmStand: true }), "green-valley");
    assert.equal(recommendDemoKit({ hasMenus: true }), "mill-and-crumb");
    assert.equal(recommendDemoKit({}), "north-and-field");
  });

  it("uses only local /demo/kits paths", () => {
    for (const kit of listDemoKits()) {
      for (const p of kit.products) {
        assert.match(p.packshotPath, /^\/demo\/kits\//);
      }
      assert.match(kit.images.heroWide, /^\/demo\/kits\//);
    }
  });
});

describe("blueprint distinctness", () => {
  it("enforces Phase 8D.1 §6.2 registry rules", () => {
    assert.doesNotThrow(() => assertBlueprintDistinctness());
  });
});

describe("demo asset rejection", () => {
  it("detects demo kit URLs", () => {
    const hits = findDemoAssetReferences({
      hero: "/demo/kits/green-valley/hero-wide.svg",
    });
    assert.equal(hits.length, 1);
  });

  it("allows seller plans without demo paths", () => {
    const ctx: WebsiteBusinessContext = {
      ownerId: "o1",
      businessMode: "BOTH",
      businessName: "Test Farm",
      headline: "Test",
      subheadline: null,
      about: "About us text for the farm.",
      regionLabel: null,
      hasFarmStand: true,
      hasMenus: false,
      hasDelivery: false,
      hasPickup: true,
      productCount: 4,
      categoryCount: 2,
      reviewCount: 0,
      categories: [],
      featuredProducts: [],
      productPhotoCount: 2,
      logoUrl: null,
      heroImageUrl: null,
      accentColor: null,
      secondaryColor: null,
      existingTemplateId: null,
      hasExistingStudio: false,
    };
    const planned = planSiteHeuristic({
      businessContext: ctx,
      intent: { blueprintId: "local", selectedPages: ["HOME", "ABOUT", "SHOP"] },
    });
    assert.equal(planned.ok, true);
    if (!planned.ok) return;
    assert.doesNotThrow(() => assertNoDemoAssets(planned.plan));
    const compiled = compilePlanToStudioPayload(planned.plan);
    assert.equal(compiled.errors.length, 0);
  });

  it("rejects plans that inject demo assets", () => {
    assert.throws(
      () =>
        assertNoDemoAssets({
          pages: [{ sections: [{ imageUrl: "/demo/kits/x.svg" }] }],
        }),
      /demo assets/,
    );
  });
});
