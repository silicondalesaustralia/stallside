import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parsePreOrderFromForm } from "./pre-order";
import { payOptionsKey, payOptionsOf } from "./pre-order-pay-options";

function form(fields: Record<string, string>, options: string[] = []): FormData {
  const fd = new FormData();
  fd.set("isPreOrder", "on");
  fd.set("orderByAt", "2026-11-05T18:00");
  fd.set("collectionAt", "2026-11-07T09:00");
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  for (const o of options) fd.append("paymentOptions", o);
  return fd;
}

describe("parsePreOrderFromForm payment timing", () => {
  it("allows pay at pickup without a card rail", () => {
    const r = parsePreOrderFromForm(form({ paymentTiming: "PAY_AT_PICKUP" }), false, false);
    assert.ok(r.ok);
    assert.equal(r.data.paymentTiming, "PAY_AT_PICKUP");
    assert.equal(r.data.depositPercent, null);
  });

  it("requires a card rail for pay now and deposits", () => {
    const r = parsePreOrderFromForm(form({ paymentTiming: "PAY_UPFRONT" }), false, false);
    assert.equal(r.ok, false);
  });

  it("rejects pay at pickup with delivery", () => {
    const fd = form({ paymentTiming: "PAY_AT_PICKUP", handoverMode: "DELIVER" });
    assert.equal(parsePreOrderFromForm(fd, true, true).ok, false);
  });

  it("ignores the deposit percent on pay at pickup", () => {
    const fd = form({ paymentTiming: "PAY_AT_PICKUP", depositPercent: "40" });
    const r = parsePreOrderFromForm(fd, true, true);
    assert.ok(r.ok);
    assert.equal(r.data.depositPercent, null);
  });

  it("parses a deposit", () => {
    const fd = form({ paymentTiming: "DEPOSIT_THEN_BALANCE", depositPercent: "25" });
    const r = parsePreOrderFromForm(fd, true, true);
    assert.ok(r.ok);
    assert.equal(r.data.paymentTiming, "DEPOSIT_THEN_BALANCE");
    assert.equal(r.data.depositPercent, 25);
  });
});

describe("parsePreOrderFromForm multiple payment options", () => {
  it("keeps every ticked option in display order, first is the default", () => {
    const fd = form({ depositPercent: "20" }, ["PAY_AT_PICKUP", "PAY_UPFRONT", "DEPOSIT_THEN_BALANCE"]);
    const r = parsePreOrderFromForm(fd, true, true);
    assert.ok(r.ok && r.data.isPreOrder);
    assert.deepEqual(r.data.paymentOptions, ["PAY_UPFRONT", "DEPOSIT_THEN_BALANCE", "PAY_AT_PICKUP"]);
    assert.equal(r.data.paymentTiming, "PAY_UPFRONT");
    assert.equal(r.data.depositPercent, 20);
  });

  it("needs at least one option", () => {
    assert.equal(parsePreOrderFromForm(form({}), true, true).ok, false);
  });

  it("rejects card options without a card rail", () => {
    const fd = form({}, ["PAY_UPFRONT", "PAY_AT_PICKUP"]);
    assert.equal(parsePreOrderFromForm(fd, false, false).ok, false);
  });
});

describe("payOptionsOf", () => {
  it("falls back to paymentTiming for older rows", () => {
    assert.deepEqual(payOptionsOf({ paymentTiming: "DEPOSIT_THEN_BALANCE", paymentOptions: [] }), [
      "DEPOSIT_THEN_BALANCE",
    ]);
    assert.deepEqual(payOptionsOf({ paymentTiming: "PAY_NOW" }), ["PAY_UPFRONT"]);
  });

  it("sorts saved options so cart comparisons match", () => {
    const a = payOptionsOf({ paymentTiming: "PAY_UPFRONT", paymentOptions: ["PAY_AT_PICKUP", "PAY_UPFRONT"] });
    assert.equal(payOptionsKey(a), "PAY_UPFRONT,PAY_AT_PICKUP");
  });
});
