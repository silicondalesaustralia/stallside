import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SubscriptionStatus } from "../generated/prisma/client";
import { proOverageFeeCents, stripeFixedFeeCents } from "./fee-v2026";
import { computeVendlCheckoutFees, vendlFixedFeeCents } from "./stallside-fee";

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

describe("V2026 Free", () => {
  it("Stripe absorb: 2.5% + 30c", () => {
    const r = computeVendlCheckoutFees(500, v2Free, stripe);
    assert.deepEqual(r, { applicationFeeCents: 43, chargeTotalCents: 500, passedOn: false });
  });

  it("Stripe pass-on grosses up the fixed fee", () => {
    const r = computeVendlCheckoutFees(500, v2FreePassOn, { rail: "stripe", currency: "USD" });
    assert.equal(r.chargeTotalCents, 544);
    assert.equal(r.applicationFeeCents, 44);
    assert.equal(r.passedOn, true);
  });

  it("AUD never passes the fee on (surcharge ban)", () => {
    const r = computeVendlCheckoutFees(500, v2FreePassOn, stripe);
    assert.deepEqual(r, { applicationFeeCents: 43, chargeTotalCents: 500, passedOn: false });
    const usdStandAudOwner = computeVendlCheckoutFees(
      500,
      { ...v2FreePassOn, billingCurrency: "AUD" },
      { rail: "stripe", currency: "USD" },
    );
    assert.equal(usdStandAudOwner.passedOn, false);
  });

  it("Square and PayPal: 2.5% only", () => {
    assert.equal(computeVendlCheckoutFees(500, v2Free, square).applicationFeeCents, 13);
    assert.equal(computeVendlCheckoutFees(500, v2Free, paypal).applicationFeeCents, 13);
    assert.equal(
      computeVendlCheckoutFees(500, v2FreePassOn, { rail: "square", currency: "USD" })
        .chargeTotalCents,
      513,
    );
  });

  it("fixed fee follows currency", () => {
    const r = computeVendlCheckoutFees(500, v2Free, { rail: "stripe", currency: "GBP" });
    assert.equal(r.applicationFeeCents, 33);
    assert.equal(stripeFixedFeeCents("eur"), 25);
  });

  it("absorb fee never exceeds the charge", () => {
    const r = computeVendlCheckoutFees(20, v2Free, stripe);
    assert.equal(r.applicationFeeCents, 20);
  });
});

describe("LEGACY is unchanged", () => {
  it("Free Stripe: 2.5% only", () => {
    assert.equal(computeVendlCheckoutFees(500, legacyFree, stripe).applicationFeeCents, 13);
    assert.equal(vendlFixedFeeCents(legacyFree, "stripe", "AUD"), 0);
  });

  it("Pro: no overage even with volume", () => {
    const r = computeVendlCheckoutFees(20_000, legacyPro, {
      ...stripe,
      monthStripeVolumeCents: 900_000,
    });
    assert.equal(r.applicationFeeCents, 0);
  });
});

describe("V2026 Pro overage", () => {
  it("0 without volume data or under allowance", () => {
    assert.equal(computeVendlCheckoutFees(20_000, v2Pro, stripe).applicationFeeCents, 0);
    const under = computeVendlCheckoutFees(20_000, v2Pro, {
      ...stripe,
      monthStripeVolumeCents: 100_000,
    });
    assert.equal(under.applicationFeeCents, 0);
  });

  it("0.5% on the part above A$4,000, never passed on", () => {
    const r = computeVendlCheckoutFees(20_000, v2Pro, {
      ...stripe,
      monthStripeVolumeCents: 390_000,
    });
    assert.deepEqual(r, { applicationFeeCents: 50, chargeTotalCents: 20_000, passedOn: false });
  });

  it("Square has no overage", () => {
    const r = computeVendlCheckoutFees(20_000, v2Pro, {
      ...square,
      monthStripeVolumeCents: 900_000,
    });
    assert.equal(r.applicationFeeCents, 0);
  });

  it("re-granted lifetime has no overage", () => {
    const r = computeVendlCheckoutFees(20_000, v2Lifetime, {
      ...stripe,
      monthStripeVolumeCents: 900_000,
    });
    assert.equal(r.applicationFeeCents, 0);
  });

  it("proOverageFeeCents when already over allowance", () => {
    assert.equal(proOverageFeeCents(10_000, 500_000), 50);
    assert.equal(proOverageFeeCents(0, 500_000), 0);
  });
});
