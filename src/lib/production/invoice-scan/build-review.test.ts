import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildReview } from "./build-review";
import type { ExtractedInvoice } from "./extract";
import { defaultCostBasis, taxRegionForCurrency } from "./tax-region";

const line = (description: string, lineTotal: number, extra: Partial<ExtractedInvoice["lines"][number]> = {}) => ({
  description,
  packCount: 1,
  packSize: null,
  packUnit: null,
  lineTotal,
  lineTax: null,
  taxable: null,
  isMaterial: true,
  confidence: "high" as const,
  ...extra,
});

const invoice = (over: Partial<ExtractedInvoice>): ExtractedInvoice => ({
  isInvoice: true,
  supplier: "Supplier",
  invoiceNumber: "1",
  invoiceDate: "2026-10-01",
  currency: null,
  pricesIncludeTax: null,
  subtotal: null,
  tax: null,
  total: null,
  lines: [],
  ...over,
});

const ctx = (currency: string, gstRegistered = false) => ({
  materials: [],
  region: taxRegionForCurrency(currency),
  costBasis: defaultCostBasis({ gstRegistered, taxCountry: null, taxRateBps: null }, currency),
  today: "2026-10-26",
  receiptUrl: null,
  duplicateOf: null,
});

describe("buildReview tax handling", () => {
  it("US: shares a sales-tax total across taxable lines and always records inc-tax", () => {
    const review = buildReview(
      invoice({
        tax: 1.5,
        total: 31.5,
        lines: [line("Flour", 10, { taxable: false }), line("Boxes", 20, { taxable: true })],
      }),
      ctx("USD", true),
    );
    assert.equal(review.taxLabel, "sales tax");
    assert.equal(review.taxRecoverable, false);
    assert.equal(review.costBasis, "inc-tax");
    assert.deepEqual(review.lines.map((l) => l.totalCents), [1000, 2150]);
  });

  it("AU GST-registered: GST-free flour stays whole, taxed lines drop their GST", () => {
    const review = buildReview(
      invoice({
        pricesIncludeTax: true,
        tax: 2,
        total: 42,
        lines: [line("Flour", 20, { lineTax: 0 }), line("Baking paper", 22, { lineTax: 2 })],
      }),
      ctx("AUD", true),
    );
    assert.equal(review.costBasis, "ex-tax");
    assert.deepEqual(review.lines.map((l) => l.totalCents), [2000, 2000]);
  });

  it("UK: VAT, inc-tax by default but switchable", () => {
    const review = buildReview(
      invoice({ tax: 4, total: 24, lines: [line("Butter", 20)] }),
      ctx("GBP"),
    );
    assert.equal(review.taxLabel, "VAT");
    assert.equal(review.taxRecoverable, true);
    assert.equal(review.costBasis, "inc-tax");
    assert.equal(review.lines[0].totalCents, 2400);
    assert.equal(review.lines[0].taxCents, 400);
  });
});
