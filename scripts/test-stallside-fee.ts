import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SubscriptionStatus } from "../src/generated/prisma/client";
import {
  stallsideFeeCents,
  stallsidePassOnChargeCents,
  stallsidePassOnFeeCents,
} from "../src/lib/money";
import {
  computeVendlCheckoutFees,
  shouldChargeVendlFee,
} from "../src/lib/stallside-fee";

describe("stallsideFeeCents (2.5% only)", () => {
  it("A$5 absorb fee is 13¢", () => {
    assert.equal(stallsideFeeCents(500), 13);
  });

  it("zero and negative amounts are 0", () => {
    assert.equal(stallsideFeeCents(0), 0);
    assert.equal(stallsideFeeCents(-100), 0);
  });

  it("has no fixed 30¢ component", () => {
    assert.equal(stallsideFeeCents(100), 3);
    assert.notEqual(stallsideFeeCents(100), 33);
  });
});

describe("pass-on gross-up", () => {
  it("A$5 → charge A$5.13 and fee 13¢", () => {
    assert.equal(stallsidePassOnChargeCents(500), 513);
    assert.equal(stallsidePassOnFeeCents(500), 13);
  });

  it("fee equals charge minus subtotal", () => {
    for (const sub of [1, 99, 500, 1999, 10000]) {
      const charge = stallsidePassOnChargeCents(sub);
      assert.equal(stallsidePassOnFeeCents(sub), charge - sub);
    }
  });
});

describe("computeVendlCheckoutFees", () => {
  const free = {
    subscriptionPlan: "free",
    subscriptionStatus: SubscriptionStatus.NONE,
    passFeeToCustomer: false,
  };
  const freePassOn = { ...free, passFeeToCustomer: true };
  const pro = {
    subscriptionPlan: "pro",
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    stripeSubscriptionId: "sub_x",
    passFeeToCustomer: false,
  };
  const lifetime = {
    subscriptionPlan: "free",
    lifetimeAccess: true,
    subscriptionStatus: SubscriptionStatus.NONE,
  };
  const adminTestingFree = {
    subscriptionPlan: "free",
    subscriptionStatus: SubscriptionStatus.NONE,
    contactEmail: "jono@silicondales.com",
    passFeeToCustomer: false,
  };

  it("Free absorb: charge subtotal, fee 13¢ on A$5", () => {
    const r = computeVendlCheckoutFees(500, free);
    assert.equal(r.chargeTotalCents, 500);
    assert.equal(r.applicationFeeCents, 13);
  });

  it("Free pass-on: charge 513, fee 13 on A$5", () => {
    const r = computeVendlCheckoutFees(500, freePassOn);
    assert.equal(r.chargeTotalCents, 513);
    assert.equal(r.applicationFeeCents, 13);
  });

  it("Pro: no Vendl fee", () => {
    assert.equal(shouldChargeVendlFee(pro), false);
    const r = computeVendlCheckoutFees(500, pro);
    assert.equal(r.applicationFeeCents, 0);
    assert.equal(r.chargeTotalCents, 500);
  });

  it("lifetime: no Vendl fee", () => {
    const r = computeVendlCheckoutFees(500, lifetime);
    assert.equal(r.applicationFeeCents, 0);
    assert.equal(r.chargeTotalCents, 500);
  });

  it("platform-admin on Free for testing: no Vendl fee", () => {
    assert.equal(shouldChargeVendlFee(adminTestingFree), false);
    const r = computeVendlCheckoutFees(500, adminTestingFree);
    assert.equal(r.applicationFeeCents, 0);
    assert.equal(r.chargeTotalCents, 500);
  });
});
