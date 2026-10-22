import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { betaAppMainOnlyPath, betaAppSkipsCron, mainAppUrl } from "../beta-app";
import { appRedirectHost } from "./host-mode";
import { resolveHostname } from "./hostname";

const KEYS = [
  "VENDL_BETA_APP",
  "VENDL_MAIN_APP_URL",
  "VENDL_APP_HOST",
  "VENDL_HOST_ENV",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;
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

describe("beta app", () => {
  it("is off by default: no crons skipped, no redirects", () => {
    assert.equal(betaAppSkipsCron("/api/cron/lifecycle"), false);
    assert.equal(betaAppMainOnlyPath("/signup"), false);
    assert.equal(appRedirectHost(), "vendl.app");
  });

  it("skips Social crons on the beta app until the Social database is configured", () => {
    process.env.VENDL_BETA_APP = "1";
    assert.equal(betaAppSkipsCron("/api/cron/publish-due-social-posts"), true);
    assert.equal(betaAppSkipsCron("/api/cron/gbp-performance-sync"), true);
    assert.equal(betaAppSkipsCron("/api/cron/process-website-generation"), false);
    assert.equal(betaAppSkipsCron("/api/cron/calendar-sync"), false);
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "key";
    assert.equal(betaAppSkipsCron("/api/cron/publish-due-social-posts"), false);
  });

  it("skips main's crons and keeps its own on the beta app", () => {
    process.env.VENDL_BETA_APP = "1";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "key";
    for (const cron of ["lifecycle", "balance-dunning", "membership-collections", "checkout-sweep", "square-reconcile"]) {
      assert.equal(betaAppSkipsCron(`/api/cron/${cron}`), true, cron);
    }
    for (const cron of ["publish-due-social-posts", "process-website-generation", "calendar-sync"]) {
      assert.equal(betaAppSkipsCron(`/api/cron/${cron}`), false, cron);
    }
    assert.equal(betaAppSkipsCron("/api/social/context"), false);
  });

  it("sends sign-up and onboarding to the main app", () => {
    process.env.VENDL_BETA_APP = "1";
    assert.equal(betaAppMainOnlyPath("/signup"), true);
    assert.equal(betaAppMainOnlyPath("/onboarding/business"), true);
    assert.equal(betaAppMainOnlyPath("/dashboard"), false);
    assert.equal(mainAppUrl(), "https://www.vendl.app");
    process.env.VENDL_MAIN_APP_URL = "https://www.vendl.app/";
    assert.equal(mainAppUrl(), "https://www.vendl.app");
  });

  it("serves beta.vendl.app as the app and redirects shop hosts there", () => {
    assert.deepEqual(resolveHostname("beta.vendl.app"), { type: "APP" });
    process.env.VENDL_APP_HOST = "beta.vendl.app";
    assert.equal(appRedirectHost(), "beta.vendl.app");
  });

  it("treats stallside.app as a custom domain host (middleware skips the lookup for it)", () => {
    assert.deepEqual(resolveHostname("stallside.app"), { type: "CUSTOM_DOMAIN", hostname: "stallside.app" });
  });
});
