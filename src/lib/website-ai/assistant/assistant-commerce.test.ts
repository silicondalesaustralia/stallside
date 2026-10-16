import { test } from "node:test";
import assert from "node:assert/strict";
import type { SerializedNodes } from "@craftjs/core";
import { buildCandidate } from "./jobs/candidate";
import { normalizePlan } from "./plan/normalize";
import { pageTargets } from "./plan/targets";
import { extractWebsiteStudio } from "@/lib/studio/storage";
import { compileCommercePages, replaceableCommercePage } from "./compile/commerce";
import { chooseDesign } from "./compile/design";
import { productInfoRows } from "./compile/product-info";
import { searchProfileFacts } from "./context/search-profile";
import { fixtureBrief, fixtureContext } from "./test-fixtures";

const SELLER_PRODUCT_PAGE = {
  ROOT: { type: { resolvedName: "CraftPageRoot" }, isCanvas: true, props: {}, displayName: "CraftPageRoot", custom: {}, hidden: false, nodes: ["mine"], linkedNodes: {}, parent: null },
  mine: { type: { resolvedName: "CraftProductDetailSection" }, isCanvas: false, props: { layout: "gallery" }, displayName: "CraftProductDetailSection", custom: {}, hidden: false, nodes: [], linkedNodes: {}, parent: "ROOT" },
} as unknown as SerializedNodes;

test("product info rows come only from confirmed facts", () => {
  const ctx = fixtureContext({
    searchProfile: searchProfileFacts({ address: { street: "1 Hidden Rd", locality: "Testville" }, showStreetAddress: true }),
    features: { ...fixtureContext().features, cardPayments: true },
  });
  const texts = productInfoRows(ctx).map((r) => r.text);
  assert.deepEqual(texts, ["Pickup only", "Laid this morning", "Local to Testville", "Secure checkout"]);
  const bare = productInfoRows(fixtureContext({
    catalogue: { ...fixtureContext().catalogue, freshnessNotes: [], fulfilments: [] },
    features: { ...fixtureContext().features, pickup: false },
    stand: { name: "Stand", locality: null },
  }));
  assert.deepEqual(bare, []);
});

test("commerce pages compile and validate; none without products", () => {
  const ctx = fixtureContext();
  const design = chooseDesign(ctx, fixtureBrief());
  const out = compileCommercePages(ctx, design, true);
  assert.deepEqual(out.errors, []);
  assert.ok(out.pages["commerce-product"]);
  assert.ok(out.pages["commerce-shop"]);
  assert.equal(out.pages["commerce-category"], undefined, "no category page without categories");
  const none = compileCommercePages(fixtureContext({ catalogue: { ...ctx.catalogue, productCount: 0, products: [] } }), design, true);
  assert.deepEqual(none.pages, {});
});

test("hand-made product pages are kept; assistant-made ones are replaced", () => {
  assert.equal(replaceableCommercePage(SELLER_PRODUCT_PAGE), false);
  const ctx = fixtureContext();
  const brief = fixtureBrief();
  const plan = normalizePlan(null, pageTargets(ctx, brief));
  const run = (pageNodes: Record<string, SerializedNodes>) =>
    buildCandidate({
      ctx,
      businessMode: "FARM_STAND",
      brief,
      state: { plan, contents: {} },
      baseDraft: { websiteStudio: { version: 2, engine: "craft", templateId: "market", pageNodes } },
    });
  const kept = run({ "commerce-product": SELLER_PRODUCT_PAGE });
  assert.equal(kept.ok, true);
  if (!kept.ok) return;
  assert.deepEqual(extractWebsiteStudio(kept.candidate.draft)?.pageNodes?.["commerce-product"], SELLER_PRODUCT_PAGE);
  const fresh = run({});
  if (!fresh.ok) return assert.fail("build failed");
  const product = extractWebsiteStudio(fresh.candidate.draft)?.pageNodes?.["commerce-product"];
  assert.ok(product && replaceableCommercePage(product), "assistant product page written and marked");
});
