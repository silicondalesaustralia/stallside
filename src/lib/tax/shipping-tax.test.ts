import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { shippingTax } from "./shipping-tax";

describe("shippingTax", () => {
  it("is zero when delivery is not taxable or tax is off", () => {
    assert.deepEqual(shippingTax({ rateBps: 1000, inclusive: true }, false, 1100), { addedCents: 0, recordedCents: 0 });
    assert.deepEqual(shippingTax(null, true, 1100), { addedCents: 0, recordedCents: 0 });
  });

  it("records GST inside an inclusive delivery fee", () => {
    assert.deepEqual(shippingTax({ rateBps: 1000, inclusive: true }, true, 1100), { addedCents: 0, recordedCents: 100 });
  });

  it("adds sales tax on top of a US delivery fee", () => {
    assert.deepEqual(shippingTax({ rateBps: 825, inclusive: false }, true, 1000), { addedCents: 83, recordedCents: 83 });
  });
});
