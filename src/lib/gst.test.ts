import { test } from "node:test";
import assert from "node:assert/strict";
import { allocateDiscount, lineGstCents, splitSalesByGst } from "./gst";
import { taxConfig, taxRule } from "./tax/config";

const AU_GST = { rateBps: 1000, inclusive: true };

test("GST is 1/11 of taxable lines only", () => {
  const lines = [
    { lineTotalCents: 1100, gstFree: false },
    { lineTotalCents: 500, gstFree: true },
  ];
  assert.deepEqual(lineGstCents(lines, 0, AU_GST), [100, 0]);
  assert.deepEqual(lineGstCents(lines, 0, null), [0, 0]);
});

test("discount is spread across lines before GST", () => {
  assert.deepEqual(allocateDiscount([1000, 1000], 300), [150, 150]);
  assert.deepEqual(allocateDiscount([1000, 2000], 100), [33, 67]);
  const lines = [
    { lineTotalCents: 2200, gstFree: false },
    { lineTotalCents: 2200, gstFree: true },
  ];
  assert.deepEqual(lineGstCents(lines, 1100, AU_GST), [150, 0]);
  assert.deepEqual(splitSalesByGst(lines, 1100), {
    gstFreeCents: 1650,
    taxableCents: 1650,
  });
});

test("discount never exceeds subtotal", () => {
  assert.deepEqual(allocateDiscount([500], 900), [500]);
  assert.deepEqual(lineGstCents([{ lineTotalCents: 500, gstFree: false }], 900, AU_GST), [0]);
});

test("UK VAT at 20% is 1/6 of an inclusive price", () => {
  assert.deepEqual(lineGstCents([{ lineTotalCents: 1200, gstFree: false }], 0, { rateBps: 2000, inclusive: true }), [200]);
});

test("US sales tax is added on top", () => {
  const lines = [
    { lineTotalCents: 1000, gstFree: false },
    { lineTotalCents: 1000, gstFree: true },
  ];
  assert.deepEqual(lineGstCents(lines, 0, { rateBps: 825, inclusive: false }), [83, 0]);
});

test("owners without saved settings keep AUD-only GST", () => {
  const legacy = { gstRegistered: true, taxCountry: null, taxRateBps: null };
  assert.deepEqual(taxRule(taxConfig(legacy, "AUD")), AU_GST);
  assert.equal(taxRule(taxConfig(legacy, "USD")), null);
  assert.equal(taxRule(taxConfig({ ...legacy, taxCountry: "US" }, "USD")), null, "US needs a rate");
  assert.deepEqual(taxRule(taxConfig({ ...legacy, taxCountry: "US", taxRateBps: 825 }, "USD")), {
    rateBps: 825,
    inclusive: false,
  });
  assert.equal(taxConfig({ ...legacy, taxCountry: "GB" }, "GBP").name, "VAT");
});
