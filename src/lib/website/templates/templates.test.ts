import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractWebsiteStudio } from "@/lib/studio/storage";
import { STUDIO_VERSION } from "@/lib/studio/types";
import { validateStudioNodes } from "@/lib/studio/validate-state";
import { instantiateTemplate } from "./instantiate";
import { TEMPLATE_PACKAGES, findTemplatePackage, templatePackagesFor } from "./packages";
import {
  applyTemplateToDraft,
  readTemplateRestorePoint,
  undoTemplateOnDraft,
  withoutDraftOnlyKeys,
} from "./restore-point";
import { fillTokens } from "./tokens";
import { validateTemplatePackage } from "./validate-package";

const PRODUCT_FIRST = findTemplatePackage("product-first")!;

describe("template packages", () => {
  for (const pkg of TEMPLATE_PACKAGES) {
    it(`${pkg.id} validates for every business mode it claims`, () => {
      const result = validateTemplatePackage(pkg);
      assert.ok(result.pkg, JSON.stringify(result.diagnostics));
    });
  }

  it("filters by business mode", () => {
    assert.ok(!templatePackagesFor("FARM_STAND").some((p) => p.id === "weekly-release"));
    assert.ok(templatePackagesFor("FOOD_BUSINESS").some((p) => p.id === "weekly-release"));
  });

  it("rejects unknown tokens, duplicate slots and bad variants", () => {
    const bad = structuredClone(PRODUCT_FIRST);
    bad.pages.home[0].props = { headline: "{{business.owner}}" };
    bad.pages.home.push({ ...bad.pages.home[1] });
    bad.pages.home[2].variant = "not-a-variant";
    const messages = validateTemplatePackage(bad).diagnostics.map((d) => d.message).join("\n");
    assert.match(messages, /Unknown token/);
    assert.match(messages, /used twice/);
    assert.match(messages, /not-a-variant/);
  });
});

describe("instantiateTemplate", () => {
  it("fills seller tokens and is deterministic", () => {
    const seller = { businessName: "Green Valley", headline: "Fresh eggs", businessMode: "BOTH" as const };
    const a = instantiateTemplate(PRODUCT_FIRST, seller);
    assert.deepEqual(a, instantiateTemplate(PRODUCT_FIRST, seller));
    assert.equal(a.pages.home["home-hero"].props.headline, "Fresh eggs");
    assert.ok(validateStudioNodes(a.pages.home).ok);
    assert.ok(validateStudioNodes(a.pages["commerce-shop"]).ok);
  });

  it("skips sections that don't fit the business mode", () => {
    const stand = instantiateTemplate(PRODUCT_FIRST, { businessName: "A", businessMode: "FARM_STAND" });
    assert.equal(stand.pages.home["home-menu"], undefined);
    const story = instantiateTemplate(findTemplatePackage("story-first")!, {
      businessName: "A",
      businessMode: "FOOD_BUSINESS",
    });
    assert.equal(story.pages.home["home-stand"], undefined);
  });

  it("headline falls back to the business name", () => {
    assert.equal(fillTokens("{{business.headline}}", { businessName: "Mill", businessMode: "BOTH" }), "Mill");
  });
});

describe("template restore point", () => {
  const instance = instantiateTemplate(PRODUCT_FIRST, { businessName: "A", businessMode: "BOTH" });
  const customLayout = instance.pages.home;
  const draft = {
    identity: { headline: "Mine" },
    websiteStudio: { version: STUDIO_VERSION, engine: "craft", templateId: "artisan", pageNodes: { about: customLayout } },
  };

  it("replaces only template pages and keeps custom pages", () => {
    const applied = applyTemplateToDraft(draft, PRODUCT_FIRST.id, instance, new Date(0));
    const studio = extractWebsiteStudio(applied)!;
    assert.equal(studio.templateId, "market");
    assert.ok(studio.nodes);
    assert.ok(studio.pageNodes?.about);
    assert.equal(readTemplateRestorePoint(applied)?.packageId, "product-first");
    assert.equal((withoutDraftOnlyKeys(applied) as Record<string, unknown>).websiteTemplateRestorePoint, undefined);
  });

  it("undo restores the previous layouts and removes the restore point", () => {
    const applied = applyTemplateToDraft(draft, PRODUCT_FIRST.id, instance, new Date(0));
    const undone = undoTemplateOnDraft(applied)!;
    const studio = extractWebsiteStudio(undone)!;
    assert.equal(studio.templateId, "artisan");
    assert.equal(studio.nodes, undefined);
    assert.equal(studio.pageNodes?.["commerce-shop"], undefined);
    assert.ok(studio.pageNodes?.about);
    assert.equal(readTemplateRestorePoint(undone), null);
    assert.equal(undoTemplateOnDraft(undone), null);
  });
});
