import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  clearHeroDecorativeFromNodes,
  extractWebsiteStudio,
  clearHeroDecorativeFromDraftRaw,
} from "@/lib/studio/storage";
import {
  LAYOUT_RECIPE_IDS,
  pickLayoutRecipe,
  slotsForRecipe,
  heroPresetForRecipe,
} from "@/lib/website-ai/layout-recipes";
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

describe("clearHeroDecorativeFromNodes", () => {
  it("strips decorative and image URLs from CraftHeroSection", () => {
    const nodes = {
      ROOT: {
        type: { resolvedName: "CraftPageRoot" },
        isCanvas: true,
        props: {},
        displayName: "CraftPageRoot",
        custom: {},
        hidden: false,
        nodes: ["a"],
        linkedNodes: {},
      },
      a: {
        type: { resolvedName: "CraftHeroSection" },
        isCanvas: false,
        props: {
          headline: "Hi",
          decorativeImageUrl: "https://example.com/d.jpg",
          imageUrl: "https://example.com/i.jpg",
        },
        displayName: "CraftHeroSection",
        custom: {},
        hidden: false,
        nodes: [],
        linkedNodes: {},
      },
    } as unknown as import("@craftjs/core").SerializedNodes;

    const cleared = clearHeroDecorativeFromNodes(nodes);
    const props = (cleared.a as { props: Record<string, unknown> }).props;
    assert.equal(props.headline, "Hi");
    assert.equal(props.decorativeImageUrl, undefined);
    assert.equal(props.imageUrl, undefined);

    const raw = clearHeroDecorativeFromDraftRaw({
      websiteStudio: {
        version: 2,
        engine: "craft",
        templateId: "farmhouse",
        nodes,
      },
    });
    const studio = extractWebsiteStudio(raw);
    assert.ok(studio);
    const heroProps = (studio!.nodes.a as { props: Record<string, unknown> }).props;
    assert.equal(heroProps.decorativeImageUrl, undefined);
  });
});

describe("layout recipes", () => {
  it("lists five recipes with distinct slot orders", () => {
    assert.equal(LAYOUT_RECIPE_IDS.length, 5);
    const orders = LAYOUT_RECIPE_IDS.map((id) => slotsForRecipe(id).join(">"));
    assert.equal(new Set(orders).size, 5);
  });

  it("picks recipe from focus and explicit intent", () => {
    const ctx = sampleCtx();
    assert.equal(
      pickLayoutRecipe(ctx, { primaryGoal: "preorders" }),
      "weekly_drop",
    );
    assert.equal(
      pickLayoutRecipe(ctx, { primaryGoal: "farm-stand" }),
      "local_visit",
    );
    assert.equal(
      pickLayoutRecipe(ctx, { layoutRecipe: "browse_catalog" }),
      "browse_catalog",
    );
    assert.ok(heroPresetForRecipe("shop_first", "market"));
  });

  it("builds HOME with always-on core for each recipe", () => {
    const ctx = sampleCtx();
    for (const recipe of LAYOUT_RECIPE_IDS) {
      const result = planSiteHeuristic({
        businessContext: ctx,
        intent: {
          layoutRecipe: recipe,
          selectedCapabilities: ["SHOP", "NEWSLETTER", "PICKUP", "MENUS_PREORDERS"],
        },
      });
      assert.equal(result.ok, true);
      if (!result.ok) continue;
      const home = result.plan.pages.find((p) => p.pageType === "HOME");
      assert.ok(home);
      const types = home!.sections.map((s) => s.type);
      assert.equal(types[0], "Hero");
      assert.ok(types.includes("ProductGrid") || types.includes("NextDrop"));
      assert.ok(types.includes("ImageText") || types.includes("About"));
      assert.ok(
        types.includes("Reviews") ||
          types.includes("Pickup") ||
          types.includes("FarmStand"),
      );
      assert.ok(types.includes("Signup"));
      const validated = validateAiSitePlan(result.plan, ctx);
      assert.equal(
        validated.ok,
        true,
        validated.ok ? "" : validated.errors.join("; "),
      );
    }
  });
});
