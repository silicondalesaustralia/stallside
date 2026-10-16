import { test } from "node:test";
import assert from "node:assert/strict";
import { pickTakeNowUpsell, type TakeNowUpsellInput, type UpsellRule } from "./rules";

const rule = (id: string, offer: string, extra: Partial<UpsellRule> = {}): UpsellRule => ({
  id,
  offerProductId: offer,
  priceCents: null,
  sitewide: false,
  productIds: [],
  categoryProductIds: [],
  ...extra,
});

const base = (over: Partial<TakeNowUpsellInput> = {}): TakeNowUpsellInput => ({
  triggerProductIds: ["eggs"],
  rules: [],
  legacyByProduct: () => null,
  legacyStand: null,
  isAvailable: () => true,
  ...over,
});

test("most specific upsell wins: product, then category, then sitewide", () => {
  const rules = [
    rule("site", "jam", { sitewide: true }),
    rule("cat", "bread", { categoryProductIds: ["eggs"] }),
    rule("prod", "bacon", { productIds: ["eggs"], priceCents: 500 }),
  ];
  assert.deepEqual(pickTakeNowUpsell(base({ rules })), { productId: "bacon", priceCents: 500, source: "rule" });
  assert.equal(pickTakeNowUpsell(base({ rules: rules.slice(0, 2) }))?.productId, "bread");
  assert.equal(pickTakeNowUpsell(base({ rules: rules.slice(0, 1) }))?.productId, "jam");
});

test("older settings still work and keep their place in the order", () => {
  const legacyByProduct = () => ({ offerProductId: "honey", priceCents: 300 });
  const legacyStand = { productId: "milk", priceCents: 200 };
  assert.equal(pickTakeNowUpsell(base({ legacyByProduct, legacyStand }))?.source, "legacy-product");
  assert.equal(pickTakeNowUpsell(base({ legacyStand }))?.productId, "milk");
  const sitewide = [rule("site", "jam", { sitewide: true })];
  assert.equal(pickTakeNowUpsell(base({ rules: sitewide, legacyByProduct }))?.productId, "honey");
  assert.equal(pickTakeNowUpsell(base({ rules: sitewide, legacyStand }))?.productId, "jam");
});

test("unavailable offers are skipped and empty carts offer nothing", () => {
  const rules = [rule("prod", "bacon", { productIds: ["eggs"] }), rule("site", "jam", { sitewide: true })];
  assert.equal(pickTakeNowUpsell(base({ rules, isAvailable: (id) => id !== "bacon" }))?.productId, "jam");
  assert.equal(pickTakeNowUpsell(base({ rules, triggerProductIds: [] })), null);
});
