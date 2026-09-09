/**
 * Getting Started payment task rules.
 * Run: npx tsx --test src/lib/setup-tasks-payments.test.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isSetupTaskComplete, type SetupFacts } from "./setup-tasks";

function facts(partial: Partial<SetupFacts>): SetupFacts {
  return {
    standCount: 1,
    productCount: 1,
    stripeChargesEnabled: false,
    squarePaymentsReady: false,
    emailAlertsEnabled: false,
    pushAlertsEnabled: false,
    orderCount: 0,
    hasStand: true,
    standSlug: "demo",
    selectedStandId: "s1",
    ...partial,
  };
}

describe("CONNECT_PAYMENTS setup task", () => {
  it("is incomplete when neither Stripe nor Square is ready", () => {
    assert.equal(
      isSetupTaskComplete("CONNECT_PAYMENTS", facts({})),
      false,
    );
  });

  it("is complete when Stripe charges are enabled", () => {
    assert.equal(
      isSetupTaskComplete(
        "CONNECT_PAYMENTS",
        facts({ stripeChargesEnabled: true }),
      ),
      true,
    );
  });

  it("is complete when Square payments are ready", () => {
    assert.equal(
      isSetupTaskComplete(
        "CONNECT_PAYMENTS",
        facts({ squarePaymentsReady: true }),
      ),
      true,
    );
  });

  it("is complete when either rail is ready", () => {
    assert.equal(
      isSetupTaskComplete(
        "CONNECT_PAYMENTS",
        facts({
          stripeChargesEnabled: true,
          squarePaymentsReady: true,
        }),
      ),
      true,
    );
  });
});
