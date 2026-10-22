import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SubscriptionStatus } from "../generated/prisma/client";
import { computeVendlCheckoutFees } from "./stallside-fee";

const free = {
  subscriptionPlan: "free",
  subscriptionStatus: SubscriptionStatus.NONE,
  passFeeToCustomer: false,
};
const pro = {
  subscriptionPlan: "pro",
  subscriptionStatus: SubscriptionStatus.ACTIVE,
  passFeeToCustomer: true,
};
const v2Free = { ...free, pricingModel: "V2026" };
const v2FreePassOn = { ...v2Free, passFeeToCustomer: true };
const v2Pro = { ...pro, pricingModel: "V2026" };
const legacyFree = { ...free, pricingModel: "LEGACY" };
const legacyPro = { ...pro, pricingModel: "LEGACY" };
const v2Lifetime = { ...free, lifetimeAccess: true, pricingModel: "V2026" };

const stripe = { rail: "stripe", currency: "AUD" } as const;
const square = { rail: "square", currency: "AUD" } as const;
const paypal = { rail: "paypal", currency: "AUD" } as const;

describe("Free", () => {
  it("Stripe absorb: 2.5% with no fixed fee", () => {
    const r = computeVendlCheckoutFees(500, v2Free, stripe);
    assert.deepEqual(r, { applicationFeeCents: 13, chargeTotalCents: 500, passedOn: false });
  });

  it("Stripe pass-on grosses up 2.5%", () => {
    const r = computeVendlCheckoutFees(500, v2FreePassOn, { rail: "stripe", currency: "USD" });
    assert.equal(r.chargeTotalCents, 513);
    assert.equal(r.applicationFeeCents, 13);
    assert.equal(r.passedOn, true);
  });

  it("AUD never passes the fee on (surcharge ban)", () => {
    const r = computeVendlCheckoutFees(500, v2FreePassOn, stripe);
    assert.deepEqual(r, { applicationFeeCents: 13, chargeTotalCents: 500, passedOn: false });
    const usdStandAudOwner = computeVendlCheckoutFees(
      500,
      { ...v2FreePassOn, billingCurrency: "AUD" },
      { rail: "stripe", currency: "USD" },
    );
    assert.equal(usdStandAudOwner.passedOn, false);
  });

  it("Square and PayPal match Stripe", () => {
    assert.equal(computeVendlCheckoutFees(500, v2Free, square).applicationFeeCents, 13);
    assert.equal(computeVendlCheckoutFees(500, v2Free, paypal).applicationFeeCents, 13);
  });

  it("LEGACY and V2026 charge the same", () => {
    assert.deepEqual(
      computeVendlCheckoutFees(500, legacyFree, stripe),
      computeVendlCheckoutFees(500, v2Free, stripe),
    );
  });
});

describe("Pro", () => {
  it("no Vendl fee on any rail, at any volume", () => {
    for (const owner of [v2Pro, legacyPro, v2Lifetime]) {
      for (const opts of [stripe, square, paypal]) {
        assert.equal(computeVendlCheckoutFees(2_000_000, owner, opts).applicationFeeCents, 0);
      }
    }
  });
});
