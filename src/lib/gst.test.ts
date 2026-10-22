import { test } from "node:test";
import assert from "node:assert/strict";
import { allocateDiscount, lineGstCents, splitSalesByGst } from "./gst";

test("GST is 1/11 of taxable lines only", () => {
  const lines = [
    { lineTotalCents: 1100, gstFree: false },
    { lineTotalCents: 500, gstFree: true },
  ];
  assert.deepEqual(lineGstCents(lines, 0, true), [100, 0]);
  assert.deepEqual(lineGstCents(lines, 0, false), [0, 0]);
});

test("discount is spread across lines before GST", () => {
  assert.deepEqual(allocateDiscount([1000, 1000], 300), [150, 150]);
  assert.deepEqual(allocateDiscount([1000, 2000], 100), [33, 67]);
  const lines = [
    { lineTotalCents: 2200, gstFree: false },
    { lineTotalCents: 2200, gstFree: true },
  ];
  assert.deepEqual(lineGstCents(lines, 1100, true), [150, 0]);
  assert.deepEqual(splitSalesByGst(lines, 1100), {
    gstFreeCents: 1650,
    taxableCents: 1650,
  });
});

test("discount never exceeds subtotal", () => {
  assert.deepEqual(allocateDiscount([500], 900), [500]);
  assert.deepEqual(lineGstCents([{ lineTotalCents: 500, gstFree: false }], 900, true), [0]);
});
