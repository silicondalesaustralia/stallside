import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shippingCostCents } from "./shipping-cost";

const lines = [
  { shippingCents: 500, quantity: 3 },
  { shippingCents: null, quantity: 2 },
];

describe("shippingCostCents", () => {
  it("charges nothing for free shipping", () => {
    assert.equal(shippingCostCents({ mode: "FREE", flatCents: 900, freeOverCents: null }, lines, 1000), 0);
  });

  it("charges one flat amount per order", () => {
    assert.equal(shippingCostCents({ mode: "FLAT", flatCents: 900, freeOverCents: null }, lines, 1000), 900);
  });

  it("charges each product's rate per item", () => {
    assert.equal(shippingCostCents({ mode: "CUSTOM", flatCents: 0, freeOverCents: null }, lines, 1000), 1500);
  });

  it("ships free at or over the threshold", () => {
    const settings = { mode: "FLAT" as const, flatCents: 900, freeOverCents: 5000 };
    assert.equal(shippingCostCents(settings, lines, 5000), 0);
    assert.equal(shippingCostCents(settings, lines, 4999), 900);
  });
});
