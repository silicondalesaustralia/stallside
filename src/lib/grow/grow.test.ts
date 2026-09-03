/**
 * Phase 7 growth unit tests (no DB).
 * Run: npm run test:grow
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computePromotionDiscount } from "./promotion-calc";
import { parseSegmentRules, SEGMENT_PRESETS } from "./segment-rules";
import { signUnsubLink, verifyUnsubLink } from "./unsub-token";
import { generateGiftCardCode } from "./gift-card-code";
import type { Promotion } from "@/generated/prisma/client";

function promo(partial: Partial<Promotion> & Pick<Promotion, "type">): Promotion {
  return {
    id: "p1",
    ownerId: "o1",
    code: "TEST",
    name: "Test",
    percentOff: null,
    amountOffCents: null,
    minOrderCents: 0,
    startsAt: null,
    endsAt: null,
    usageLimit: null,
    perCustomerLimit: 1,
    usageCount: 0,
    productIds: [],
    categoryIds: [],
    menuIds: [],
    firstOrderOnly: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial,
  };
}

describe("promotions", () => {
  it("computes percent and fixed discounts", () => {
    assert.equal(
      computePromotionDiscount(
        promo({ type: "PERCENT_OFF", percentOff: 10 }),
        { subtotalCents: 2000, productIds: ["a"] },
      ),
      200,
    );
    assert.equal(
      computePromotionDiscount(
        promo({ type: "FIXED_OFF", amountOffCents: 500 }),
        { subtotalCents: 2000, productIds: ["a"] },
      ),
      500,
    );
  });

  it("enforces minimum and first-order-only", () => {
    assert.equal(
      computePromotionDiscount(
        promo({ type: "FIXED_OFF", amountOffCents: 500, minOrderCents: 3000 }),
        { subtotalCents: 2000, productIds: ["a"] },
      ),
      0,
    );
    assert.equal(
      computePromotionDiscount(
        promo({
          type: "PERCENT_OFF",
          percentOff: 10,
          firstOrderOnly: true,
        }),
        { subtotalCents: 2000, productIds: ["a"], isFirstOrder: false },
      ),
      0,
    );
  });

  it("checks product eligibility", () => {
    assert.equal(
      computePromotionDiscount(
        promo({
          type: "PERCENT_OFF",
          percentOff: 10,
          productIds: ["x"],
        }),
        { subtotalCents: 2000, productIds: ["a"] },
      ),
      0,
    );
  });
});

describe("segments", () => {
  it("parses rules and exposes presets", () => {
    assert.deepEqual(parseSegmentRules({ minOrders: 2 }), { minOrders: 2 });
    assert.ok(SEGMENT_PRESETS.lapsed.rules.daysSinceLastOrderMin);
    assert.ok(SEGMENT_PRESETS.repeat_customers.rules.minOrders);
  });
});

describe("consent unsubscribe tokens", () => {
  it("signs and verifies", () => {
    const t = signUnsubLink("owner1", "Buyer@Example.com");
    const v = verifyUnsubLink(t);
    assert.ok(v);
    assert.equal(v.ownerId, "owner1");
    assert.equal(v.email, "buyer@example.com");
    assert.equal(verifyUnsubLink("nope"), null);
  });
});

describe("gift cards", () => {
  it("generates high-entropy codes", () => {
    const a = generateGiftCardCode();
    const b = generateGiftCardCode();
    assert.match(a, /^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/);
    assert.notEqual(a, b);
  });
});
