import assert from "node:assert/strict";
import test from "node:test";
import { onboardingActiveStep, type SetupProgress } from "./setup-progress-state";

function progress(partial: Partial<SetupProgress>): SetupProgress {
  return {
    products: false,
    website: false,
    payments: false,
    pro: false,
    ...partial,
  };
}

test("onboardingActiveStep advances past products once stock exists", () => {
  assert.equal(onboardingActiveStep(progress({})), 2);
  assert.equal(onboardingActiveStep(progress({ products: true })), 4);
  assert.equal(onboardingActiveStep(progress({ products: true, payments: true })), 5);
});

test("onboardingActiveStep keeps Pro on website until the site is started", () => {
  assert.equal(onboardingActiveStep(progress({ products: true, pro: true })), 3);
  assert.equal(
    onboardingActiveStep(progress({ products: true, pro: true, website: true })),
    4,
  );
  assert.equal(
    onboardingActiveStep(progress({ products: true, pro: true, website: true, payments: true })),
    5,
  );
});
