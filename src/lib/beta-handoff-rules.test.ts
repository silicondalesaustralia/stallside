import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { betaAppUrl, shouldHandOffToBeta } from "./beta-handoff-rules";

let saved: string | undefined;
beforeEach(() => {
  saved = process.env.BETA_APP_URL;
  delete process.env.BETA_APP_URL;
});
afterEach(() => {
  if (saved === undefined) delete process.env.BETA_APP_URL;
  else process.env.BETA_APP_URL = saved;
});

const beta = { betaFeatures: ["beta"], impersonated: false, pathname: "/dashboard" };

describe("beta hand-off", () => {
  it("is off for everyone while BETA_APP_URL is unset", () => {
    assert.equal(betaAppUrl(), null);
    assert.equal(shouldHandOffToBeta(beta), false);
  });

  it("ignores a non-https BETA_APP_URL", () => {
    process.env.BETA_APP_URL = "http://beta.vendl.app";
    assert.equal(shouldHandOffToBeta(beta), false);
  });

  it("never hands off owners without the beta flag", () => {
    process.env.BETA_APP_URL = "https://beta.vendl.app/";
    assert.equal(betaAppUrl(), "https://beta.vendl.app");
    for (const betaFeatures of [[], ["social"], ["Beta"]]) {
      assert.equal(shouldHandOffToBeta({ ...beta, betaFeatures }), false, JSON.stringify(betaFeatures));
    }
  });

  it("hands off beta owners, except admin log-in-as and the Square page", () => {
    process.env.BETA_APP_URL = "https://beta.vendl.app";
    assert.equal(shouldHandOffToBeta(beta), true);
    assert.equal(shouldHandOffToBeta({ ...beta, pathname: "/dashboard/orders" }), true);
    assert.equal(shouldHandOffToBeta({ ...beta, impersonated: true }), false);
    assert.equal(shouldHandOffToBeta({ ...beta, pathname: "/dashboard/settings/square" }), false);
  });
});
