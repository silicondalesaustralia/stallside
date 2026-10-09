import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SerializedNodes } from "@craftjs/core";
import type { BusinessMode } from "@/lib/business-mode";
import { mergeWebsiteStudioIntoRaw } from "@/lib/studio/storage";
import { compilePlanToStudioPayload } from "@/lib/website-ai/compile-nodes";
import { planSiteHeuristic } from "@/lib/website-ai/heuristic-planner";
import type { WebsiteBusinessContext } from "@/lib/website-ai/types";
import { hasErrors } from "@/lib/website/schema/diagnostics";
import { validateWebsiteDefinition } from "@/lib/website/schema/validate";
import { craftPageToSections } from "./from-craft";
import { storefrontConfigToDefinition } from "./from-config";
import { reportConfigMigration } from "./migration-report";
import { sectionsToCraftNodes } from "./to-craft";
import { craftPageSaveErrors } from "./validate-craft-page";

const MODES: BusinessMode[] = ["FARM_STAND", "FOOD_BUSINESS", "BOTH"];

function ctx(businessMode: BusinessMode): WebsiteBusinessContext {
  return {
    ownerId: "owner_1",
    businessMode,
    businessName: "Green Valley",
    headline: "Green Valley Farm",
    subheadline: "Fresh from our fields",
    about: "Family farm.",
    regionLabel: "Adelaide Hills",
    hasFarmStand: businessMode !== "FOOD_BUSINESS",
    hasMenus: businessMode !== "FARM_STAND",
    hasDelivery: false,
    hasPickup: true,
    productCount: 4,
    categoryCount: 2,
    reviewCount: 3,
    categories: [{ id: "c1", title: "Veg", slug: "veg" }],
    featuredProducts: [{ id: "p1", title: "Kale" }],
    productPhotoCount: 2,
    logoUrl: null,
    heroImageUrl: null,
    accentColor: null,
    secondaryColor: null,
    existingTemplateId: null,
    hasExistingStudio: false,
  };
}

function aiConfig(mode: BusinessMode): unknown {
  const planned = planSiteHeuristic({ businessContext: ctx(mode) });
  assert.equal(planned.ok, true);
  if (!planned.ok) throw new Error("plan failed");
  const { payload } = compilePlanToStudioPayload(planned.plan);
  assert.ok(payload);
  return mergeWebsiteStudioIntoRaw({}, payload.templateId, payload.nodes, payload.pageNodes);
}

describe("storefrontConfigToDefinition", () => {
  for (const mode of MODES) {
    it(`converts an AI-built ${mode} site into a valid definition`, () => {
      const { definition, diagnostics } = storefrontConfigToDefinition(aiConfig(mode), mode);
      assert.equal(hasErrors(diagnostics), false, JSON.stringify(diagnostics));
      const validated = validateWebsiteDefinition(definition, mode);
      assert.ok(validated.definition, JSON.stringify(validated.diagnostics));
      assert.ok(definition.pages.home.sections.length > 0);
    });
  }

  it("dry-run report is clean and lossless for an AI-built site", () => {
    const report = reportConfigMigration(aiConfig("BOTH"), "BOTH");
    assert.equal(report.errors.length, 0);
    assert.equal(report.lossless, true);
    assert.ok(report.sectionPages > 0);
  });

  it("treats an empty config as legacy pages, not an error", () => {
    const { definition, diagnostics } = storefrontConfigToDefinition({}, "BOTH");
    assert.equal(hasErrors(diagnostics), false);
    assert.equal(definition.pages.home.layoutSource, "legacy");
    assert.ok(validateWebsiteDefinition(definition).definition);
  });
});

describe("Craft round trip", () => {
  it("definition -> Craft -> definition is lossless", () => {
    const { definition } = storefrontConfigToDefinition(aiConfig("BOTH"), "BOTH");
    for (const page of Object.values(definition.pages)) {
      const nodes = sectionsToCraftNodes(page.sections);
      const back = craftPageToSections(nodes, `pages.${page.id}`);
      assert.deepEqual(back.sections, page.sections, page.id);
    }
  });

  it("keeps unmodelled props in extras instead of dropping them", () => {
    const nodes = sectionsToCraftNodes([
      {
        id: "a",
        type: "text",
        schemaVersion: 1,
        variant: "default",
        visibility: "hidden",
        content: { body: "Hi" },
        settings: {},
        extras: { legacyFlag: true },
      },
    ]);
    const back = craftPageToSections(nodes, "p");
    assert.deepEqual(back.sections[0].extras, { legacyFlag: true });
    assert.equal(back.sections[0].visibility, "hidden");
  });

  it("reports unknown section types as errors", () => {
    const nodes = sectionsToCraftNodes([]);
    nodes.ROOT.nodes = ["x"];
    nodes.x = {
      ...nodes.ROOT,
      type: { resolvedName: "CraftMysterySection" },
      isCanvas: false,
      parent: "ROOT",
      nodes: [],
    } as SerializedNodes[string];
    assert.ok(hasErrors(craftPageToSections(nodes, "p").diagnostics));
    assert.ok(craftPageSaveErrors(nodes, "home").length > 0);
  });
});
