import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CART_MIX_HANDOVER,
  cartHandoverNote,
  cartHandoverOptions,
  effectiveFulfilment,
  resolveCartHandover,
} from "./handover-choice";

describe("effectiveFulfilment", () => {
  it("uses the product setting, else the stand default", () => {
    const p = { isPreOrder: false, handoverMode: "COLLECT", fulfilment: null };
    assert.equal(effectiveFulfilment(p, "BOTH"), "BOTH");
    assert.equal(effectiveFulfilment({ ...p, fulfilment: "DELIVERY" }, "PICKUP"), "DELIVERY");
  });

  it("follows the pre-order page handover", () => {
    const p = { isPreOrder: true, handoverMode: "DELIVER", fulfilment: "PICKUP" as const };
    assert.equal(effectiveFulfilment(p, "PICKUP"), "DELIVERY");
  });
});

describe("resolveCartHandover", () => {
  it("defaults to pickup when both are allowed", () => {
    assert.deepEqual(resolveCartHandover(["BOTH", "PICKUP"]), { mode: "COLLECT" });
    assert.deepEqual(resolveCartHandover([]), { mode: "COLLECT" });
  });

  it("forces delivery when an item is delivery only", () => {
    assert.deepEqual(resolveCartHandover(["BOTH", "DELIVERY"]), { mode: "DELIVER" });
    assert.ok("error" in resolveCartHandover(["BOTH", "DELIVERY"], "COLLECT"));
  });

  it("honours the shopper's pick when allowed", () => {
    assert.deepEqual(resolveCartHandover(["BOTH"], "DELIVER"), { mode: "DELIVER" });
    assert.ok("error" in resolveCartHandover(["PICKUP"], "DELIVER"));
  });

  it("blocks pickup-only mixed with delivery-only", () => {
    assert.deepEqual(cartHandoverOptions(["PICKUP", "DELIVERY"]), { pickup: false, delivery: false });
    assert.deepEqual(resolveCartHandover(["PICKUP", "DELIVERY"]), { error: CART_MIX_HANDOVER });
  });
});

describe("cartHandoverNote", () => {
  it("names the one handover a cart allows, or the choice", () => {
    assert.match(cartHandoverNote(cartHandoverOptions(["PICKUP", "BOTH"])) ?? "", /pickup only/);
    assert.match(cartHandoverNote(cartHandoverOptions(["DELIVERY"])) ?? "", /shipping only/);
    assert.match(cartHandoverNote(cartHandoverOptions(["BOTH", "BOTH"])) ?? "", /choose pickup or shipping/);
    assert.equal(cartHandoverNote(cartHandoverOptions(["PICKUP", "DELIVERY"])), null);
  });
});
