import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { SerializedNodes } from "@craftjs/core";
import {
  extractWebsiteStudio,
  mergeWebsiteStudioIntoRaw,
  mergeWebsiteStudioPageIntoRaw,
  withoutStudioPage,
} from "@/lib/studio/storage";
import { isPublicStudioNode, hasInstructionalCopy } from "@/lib/studio/node-visibility";
import { overlayStorefrontIdentity, identityColumnData } from "@/lib/storefront/identity";
import { parseStorefrontConfig } from "@/lib/storefront/config";
import { findPublishBlockers } from "./publish-checks";
import { buildSeededDraftConfig } from "./seed-draft";
import { websiteSectionEnabledFor } from "../access";

function page(sectionProps: Record<string, unknown>, custom: Record<string, unknown> = {}) {
  return {
    ROOT: {
      type: { resolvedName: "CraftPageRoot" },
      isCanvas: true,
      props: {},
      displayName: "CraftPageRoot",
      custom: {},
      hidden: false,
      nodes: ["s1"],
      linkedNodes: {},
    },
    s1: {
      type: { resolvedName: "CraftTextSection" },
      isCanvas: false,
      props: sectionProps,
      displayName: "CraftTextSection",
      custom,
      hidden: false,
      nodes: [],
      linkedNodes: {},
      parent: "ROOT",
    },
  } as unknown as SerializedNodes;
}

describe("homepage storage", () => {
  it("saving another page first does not become the homepage", () => {
    const merged = mergeWebsiteStudioPageIntoRaw({}, "artisan", "commerce:shop", page({ heading: "Shop" }));
    const studio = extractWebsiteStudio(merged);
    assert.ok(studio?.pageNodes?.["commerce:shop"]);
    assert.equal(studio?.nodes, undefined);
  });

  it("saving another page keeps the existing homepage", () => {
    const home = page({ heading: "Home" });
    const withHome = mergeWebsiteStudioIntoRaw({}, "artisan", home);
    const merged = mergeWebsiteStudioPageIntoRaw(withHome, "artisan", "p1", page({ heading: "P1" }));
    assert.deepEqual(extractWebsiteStudio(merged)?.nodes, home);
  });

  it("deleting a page removes its layout", () => {
    const home = page({ heading: "Home" });
    const raw = mergeWebsiteStudioPageIntoRaw(
      mergeWebsiteStudioIntoRaw({}, "artisan", home),
      "artisan",
      "p1",
      page({ heading: "P1" }),
    );
    const removed = withoutStudioPage(raw, "artisan", home, {});
    assert.equal(extractWebsiteStudio(removed)?.pageNodes?.p1, undefined);
    assert.deepEqual(extractWebsiteStudio(removed)?.nodes, home);
  });
});

describe("section visibility and publish checks", () => {
  it("hides editor-only, hidden and not-live placeholder sections", () => {
    const visible = page({ body: "Fresh bread" })["s1"];
    assert.equal(isPublicStudioNode(visible), true);
    assert.equal(isPublicStudioNode(page({}, { visibility: "EDITOR_ONLY" })["s1"]), false);
    assert.equal(isPublicStudioNode(page({}, { placeholderKind: "SETUP_STUB" })["s1"]), false);
    assert.equal(isPublicStudioNode({ ...visible, hidden: true }), false);
  });

  it("blocks publish while instructional copy is public", () => {
    const stub = page({ body: "Tell customers how pickup works…" });
    assert.equal(hasInstructionalCopy(stub["s1"]), true);
    const raw = mergeWebsiteStudioIntoRaw({}, "artisan", stub);
    assert.equal(findPublishBlockers(raw).length, 1);
  });

  it("ignores instructional copy in editor-only sections", () => {
    const raw = mergeWebsiteStudioIntoRaw(
      {},
      "artisan",
      page({ body: "Tell customers how pickup works…" }, { visibility: "EDITOR_ONLY" }),
    );
    assert.deepEqual(findPublishBlockers(raw), []);
  });
});

describe("website identity", () => {
  const columns = {
    headline: "Live name",
    subheadline: null,
    about: "Live about",
    heroImageUrl: null,
    faviconUrl: null,
    contactEmail: null,
    showPhone: false,
  };

  it("draft identity wins over live columns, missing keys fall back", () => {
    const merged = overlayStorefrontIdentity(columns, { headline: "Draft name", heroImageUrl: null });
    assert.equal(merged.headline, "Draft name");
    assert.equal(merged.about, "Live about");
  });

  it("parses identity from config and mirrors only present keys on publish", () => {
    const config = parseStorefrontConfig({ identity: { about: "New", showPhone: true, bogus: 1 } });
    assert.deepEqual(config.identity, { about: "New", showPhone: true });
    assert.deepEqual(identityColumnData(config.identity), { about: "New", showPhone: true });
  });

  it("seeds the first draft from business details", () => {
    const seeded = buildSeededDraftConfig({
      businessMode: "FOOD_BUSINESS",
      fulfilmentIntents: ["pickup"],
      businessName: "Green Valley",
      shortDescription: "Sourdough",
      brandLogoUrl: "https://example.com/logo.png",
      brandAccentColor: "#336633",
      brandSecondaryColor: null,
    });
    assert.equal(seeded.identity?.headline, "Green Valley");
    assert.equal(seeded.identity?.logoUrl, "https://example.com/logo.png");
    assert.equal(seeded.themeOverrides?.accentColor, "#336633");
  });
});

describe("website section access", () => {
  it("is open outside production and allowlisted in production", () => {
    const env = { ...process.env };
    try {
      delete process.env.WEBSITE_SECTION_ENABLED_FOR_ALL;
      process.env.VERCEL_ENV = "preview";
      assert.equal(websiteSectionEnabledFor("o1"), true);
      process.env.VERCEL_ENV = "production";
      process.env.WEBSITE_SECTION_OWNER_IDS = "o1, o2";
      assert.equal(websiteSectionEnabledFor("o2"), true);
      assert.equal(websiteSectionEnabledFor("o3"), false);
    } finally {
      process.env = env;
    }
  });
});
