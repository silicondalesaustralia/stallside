import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addBillingPeriod,
  afterFailedCharge,
  billingCadence,
  nextBillingAfter,
  resumedBillingAt,
} from "@/lib/square-subscriptions/schedule";

const d = (iso: string) => new Date(iso);

describe("square subscription cadence", () => {
  it("maps memberships to their payment plan and boxes to the offer interval", () => {
    assert.equal(billingCadence({ isMembership: true, interval: "WEEKLY", billingPlan: "UPFRONT" }), "ONCE");
    assert.equal(billingCadence({ isMembership: true, interval: "WEEKLY", billingPlan: "MONTHLY" }), "MONTHLY");
    assert.equal(billingCadence({ isMembership: true, interval: "MONTHLY", billingPlan: "WEEKLY" }), "WEEKLY");
    assert.equal(billingCadence({ isMembership: false, interval: "FORTNIGHTLY", billingPlan: null }), "FORTNIGHTLY");
  });

  it("adds calendar months without skipping short months", () => {
    assert.equal(addBillingPeriod(d("2026-01-31T02:00:00Z"), "MONTHLY")?.toISOString(), "2026-02-28T02:00:00.000Z");
    assert.equal(addBillingPeriod(d("2026-03-15T02:00:00Z"), "MONTHLY")?.toISOString(), "2026-04-15T02:00:00.000Z");
    assert.equal(addBillingPeriod(d("2026-03-15T02:00:00Z"), "FORTNIGHTLY")?.toISOString(), "2026-03-29T02:00:00.000Z");
    assert.equal(addBillingPeriod(d("2026-03-15T02:00:00Z"), "ONCE"), null);
  });

  it("stops billing at the end of a membership term", () => {
    const start = d("2026-01-01T00:00:00Z");
    const termEnds = d("2026-01-15T00:00:00Z");
    assert.equal(nextBillingAfter(start, "WEEKLY", termEnds)?.toISOString(), "2026-01-08T00:00:00.000Z");
    assert.equal(nextBillingAfter(d("2026-01-08T00:00:00Z"), "WEEKLY", termEnds), null);
    assert.equal(nextBillingAfter(start, "ONCE", null), null);
  });

  it("charges a 26-week weekly membership exactly 26 times", () => {
    let period: Date | null = d("2026-01-01T00:00:00Z");
    const termEnds = new Date(period.getTime() + 26 * 7 * 86_400_000);
    let charges = 0;
    while (period) {
      charges += 1;
      period = nextBillingAfter(period, "WEEKLY", termEnds);
    }
    assert.equal(charges, 26);
  });
});

describe("square subscription retries", () => {
  it("retries after 1, 3 and 5 days, then cancels", () => {
    const now = d("2026-05-01T00:00:00Z");
    const first = afterFailedCharge(1, now);
    const third = afterFailedCharge(3, now);
    assert.equal(first.action === "retry" && first.retryAt.toISOString(), "2026-05-02T00:00:00.000Z");
    assert.equal(third.action === "retry" && third.retryAt.toISOString(), "2026-05-06T00:00:00.000Z");
    assert.deepEqual(afterFailedCharge(4, now), { action: "cancel" });
  });

  it("never bills for time spent paused", () => {
    const now = d("2026-05-10T00:00:00Z");
    assert.equal(resumedBillingAt(d("2026-05-01T00:00:00Z"), now)?.toISOString(), now.toISOString());
    assert.equal(resumedBillingAt(d("2026-05-20T00:00:00Z"), now)?.toISOString(), "2026-05-20T00:00:00.000Z");
    assert.equal(resumedBillingAt(null, now), null);
  });
});
