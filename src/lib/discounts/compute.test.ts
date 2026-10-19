import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeCodeDiscount,
  normalizeDiscountCode,
  pickBetterDiscount,
  type DiscountRule,
} from "./compute";

const rule = (over: Partial<DiscountRule> = {}): DiscountRule => ({
  type: "PERCENT_OFF",
  percentOff: 10,
  amountOffCents: null,
  minOrderCents: 0,
  scopeProductIds: [],
  ...over,
});

const lines = [
  { productId: "eggs", lineTotalCents: 1000 },
  { productId: "honey", lineTotalCents: 2000 },
];

test("percent off whole order", () => {
  assert.deepEqual(computeCodeDiscount(rule(), lines), {
    ok: true,
    discountCents: 300,
    freeShipping: false,
  });
});

test("percent off only scoped products", () => {
  const r = computeCodeDiscount(rule({ scopeProductIds: ["honey"] }), lines);
  assert.deepEqual(r, { ok: true, discountCents: 200, freeShipping: false });
});

test("fixed amount is capped at the eligible total", () => {
  const r = computeCodeDiscount(
    rule({ type: "FIXED_OFF", amountOffCents: 5000, scopeProductIds: ["eggs"] }),
    lines,
  );
  assert.deepEqual(r, { ok: true, discountCents: 1000, freeShipping: false });
});

test("free shipping gives no money off", () => {
  const r = computeCodeDiscount(rule({ type: "FREE_DELIVERY" }), lines);
  assert.deepEqual(r, { ok: true, discountCents: 0, freeShipping: true });
});

test("minimum order and empty scope are rejected", () => {
  assert.deepEqual(computeCodeDiscount(rule({ minOrderCents: 5000 }), lines), {
    ok: false,
    reason: "min_order",
  });
  assert.deepEqual(computeCodeDiscount(rule({ scopeProductIds: ["jam"] }), lines), {
    ok: false,
    reason: "no_eligible",
  });
});

test("best of first-order and code", () => {
  const first = { discountCents: 500, label: "First order" };
  assert.equal(pickBetterDiscount(first, { discountCents: 300, label: "Code" }).usedCode, false);
  assert.equal(pickBetterDiscount(first, { discountCents: 500, label: "Code" }).usedCode, true);
  assert.equal(pickBetterDiscount(first, null).discountCents, 500);
});

test("codes are normalised", () => {
  assert.equal(normalizeDiscountCode(" summer 10 "), "SUMMER10");
});
