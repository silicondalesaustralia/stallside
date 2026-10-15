import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { resolveHostname } from "./hostname";
import { publicApexHost, stagingRootHost } from "./host-mode";
import { isVendlInfraHostname } from "./request-hostname";
import { storefrontPublicUrl, storefrontSubdomainHost } from "./public-url";

const KEYS = ["VENDL_STAGING_HOST", "VENDL_HOST_ENV", "NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_STOREFRONT_SUBDOMAIN_PRIMARY"] as const;
let saved: Partial<Record<(typeof KEYS)[number], string>> = {};

beforeEach(() => {
  saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
  for (const k of KEYS) delete process.env[k];
});

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe("staging host setting", () => {
  it("defaults to staging.vendl.app", () => {
    assert.equal(stagingRootHost(), "staging.vendl.app");
    assert.deepEqual(resolveHostname("stagingv2.vendl.app"), { type: "APP" });
  });

  it("uses VENDL_STAGING_HOST for the app host and seller hosts", () => {
    process.env.VENDL_STAGING_HOST = "StagingV2.vendl.app";
    process.env.VENDL_HOST_ENV = "staging";
    assert.equal(stagingRootHost(), "stagingv2.vendl.app");
    assert.equal(publicApexHost(), "stagingv2.vendl.app");
    assert.deepEqual(resolveHostname("stagingv2.vendl.app"), { type: "APP" });
    assert.deepEqual(resolveHostname("www.stagingv2.vendl.app"), { type: "APP" });
    assert.deepEqual(resolveHostname("jackos-buns.stagingv2.vendl.app"), { type: "STAGING_SUBDOMAIN", slug: "jackos-buns" });
    assert.equal(storefrontSubdomainHost("Jackos-Buns"), "jackos-buns.stagingv2.vendl.app");
    assert.equal(storefrontPublicUrl("jackos-buns"), "https://stagingv2.vendl.app/shop/jackos-buns");
    assert.equal(isVendlInfraHostname("stagingv2.vendl.app"), true);
  });

  it("detects staging from NEXT_PUBLIC_APP_URL", () => {
    process.env.VENDL_STAGING_HOST = "stagingv2.vendl.app";
    process.env.NEXT_PUBLIC_APP_URL = "https://stagingv2.vendl.app";
    assert.equal(publicApexHost(), "stagingv2.vendl.app");
  });

  it("ignores hosts outside the apex or more than one level deep", () => {
    process.env.VENDL_STAGING_HOST = "staging.example.com";
    assert.equal(stagingRootHost(), "staging.vendl.app");
    process.env.VENDL_STAGING_HOST = "a.b.vendl.app";
    assert.equal(stagingRootHost(), "staging.vendl.app");
  });

  it("production stays on vendl.app", () => {
    assert.equal(publicApexHost(), "vendl.app");
    assert.deepEqual(resolveHostname("jackos-buns.vendl.app"), { type: "VENDL_SUBDOMAIN", slug: "jackos-buns" });
  });
});
