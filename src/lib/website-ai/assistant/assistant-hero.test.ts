import { test } from "node:test";
import assert from "node:assert/strict";
import { chooseContentHero, chooseHomeHero } from "./compile/hero-choice";
import { chooseDesign } from "./compile/design";
import { searchProfileFacts } from "./context/search-profile";
import { fixtureBrief, fixtureContext } from "./test-fixtures";
import type { AssistantContext } from "./context/types";

const withHours = searchProfileFacts({ hours: { sat: { opens: "08:00", closes: "12:00" } } });

function shopWith(photos: number, categories: number): Partial<AssistantContext> {
  const base = fixtureContext();
  const cats = Array.from({ length: categories }, (_, i) => ({ id: `c${i}`, title: `Cat ${i}`, slug: `cat-${i}` }));
  const products = Array.from({ length: Math.max(photos, 2) }, (_, i) => ({
    id: `p${i}`, title: `Product ${i}`, slug: `p-${i}`,
    imageUrl: i < photos ? `https://img.test/${i}.jpg` : null,
    categorySlug: cats.length ? cats[i % cats.length].slug : null,
  }));
  return {
    catalogue: { ...base.catalogue, products, productCount: products.length, productPhotoCount: photos, categories: cats },
  };
}

test("the seller's goal leads the home hero when the data supports it", () => {
  const visits = fixtureContext({ searchProfile: withHours });
  assert.equal(chooseHomeHero(visits, fixtureBrief(), "farm-landscape", false), "visit-us");

  const drops = fixtureContext({ features: { ...fixtureContext().features, upcomingDrop: true } });
  const preBrief = fixtureBrief((b) => { b.business.primaryGoal = "pre_orders"; });
  assert.equal(chooseHomeHero(drops, preBrief, "background", false), "countdown");

  const online = fixtureBrief((b) => { b.business.primaryGoal = "sell_online"; });
  assert.equal(chooseHomeHero(fixtureContext(shopWith(6, 0)), online, "background", false), "product-collage");
  assert.equal(chooseHomeHero(fixtureContext(shopWith(2, 0)), online, "background", false), "featured-product");
});

test("photo-on-top styles need the seller's own photo", () => {
  const ctx = fixtureContext();
  const pick = chooseHomeHero(ctx, fixtureBrief((b) => { b.business.primaryGoal = null; }), "background", false);
  assert.ok(["minimal", "shop-first"].includes(pick), pick);
  assert.equal(chooseContentHero("background", false), "minimal");
  assert.equal(chooseContentHero("product-collage", true), "split");
});

test("rich catalogues get category tiles or photos, chosen the same way each time", () => {
  const ctx = fixtureContext(shopWith(8, 3));
  const brief = fixtureBrief((b) => { b.business.primaryGoal = null; });
  const first = chooseHomeHero(ctx, brief, "farm-landscape", true);
  assert.ok(["category-mosaic", "farm-landscape", "split", "product-collage"].includes(first), first);
  assert.equal(chooseHomeHero(ctx, brief, "farm-landscape", true), first);
});

test("inner pages get a calm hero and the home page the chosen one", () => {
  const design = chooseDesign(fixtureContext({ searchProfile: withHours }), fixtureBrief());
  assert.equal(design.presets.hero, "visit-us");
  assert.equal(design.contentHero, "minimal");
});
