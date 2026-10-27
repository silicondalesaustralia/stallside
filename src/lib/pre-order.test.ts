import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parsePreOrderFromForm } from "./pre-order";

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  fd.set("isPreOrder", "on");
  fd.set("orderByAt", "2026-11-05T18:00");
  fd.set("collectionAt", "2026-11-07T09:00");
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
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
