/**
 * Pure hostname / public-URL utilities for Phase 4C.
 * Run: npm run test:tenancy
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeHostname, resolveHostname } from "./hostname";
import { isReservedVendlSubdomain } from "./reserved-subdomains";
import {
  storefrontBasePath,
  storefrontReturnShopUrl,
  storefrontSubdomainHost,
} from "./public-url";

describe("normalizeHostname", () => {
  it("strips port and lowercases", () => {
    assert.equal(normalizeHostname("Jackos-Buns.Vendl.App:443"), "jackos-buns.vendl.app");
  });

  it("takes first forwarded host", () => {
    assert.equal(
      normalizeHostname("jackos-buns.vendl.app, vendl.app"),
      "jackos-buns.vendl.app",
    );
  });
});

describe("resolveHostname", () => {
  it("detects apex and www as APP", () => {
    assert.deepEqual(resolveHostname("vendl.app"), { type: "APP" });
    assert.deepEqual(resolveHostname("www.vendl.app"), { type: "APP" });
  });

  it("extracts seller subdomain", () => {
    assert.deepEqual(resolveHostname("jackos-buns.vendl.app"), {
      type: "VENDL_SUBDOMAIN",
      slug: "jackos-buns",
    });
  });

  it("treats reserved labels as APP", () => {
    assert.deepEqual(resolveHostname("admin.vendl.app"), { type: "APP" });
    assert.deepEqual(resolveHostname("api.vendl.app"), { type: "APP" });
  });

  it("detects localhost and optional local subdomain", () => {
    assert.deepEqual(resolveHostname("localhost:3000"), { type: "LOCAL" });
    assert.deepEqual(resolveHostname("jackos-buns.localhost:3000"), {
      type: "LOCAL_SUBDOMAIN",
      slug: "jackos-buns",
    });
  });

  it("detects Vercel preview hosts", () => {
    assert.deepEqual(
      resolveHostname("myfarmstand-git-main-team.vercel.app"),
      { type: "VERCEL_PREVIEW" },
    );
  });

  it("rejects nested or empty labels", () => {
    assert.deepEqual(resolveHostname("a.b.vendl.app"), { type: "UNKNOWN" });
  });

  it("marks unknown custom hosts for Phase 9 resolution", () => {
    assert.deepEqual(resolveHostname("jackosbuns.com.au"), {
      type: "CUSTOM_DOMAIN",
      hostname: "jackosbuns.com.au",
    });
  });
});

describe("reserved subdomains", () => {
  it("blocks www and dashboard", () => {
    assert.equal(isReservedVendlSubdomain("www"), true);
    assert.equal(isReservedVendlSubdomain("Dashboard"), true);
    assert.equal(isReservedVendlSubdomain("jackos-buns"), false);
  });
});

describe("public URL helpers", () => {
  it("builds subdomain host", () => {
    assert.equal(storefrontSubdomainHost("Jackos-Buns"), "jackos-buns.vendl.app");
  });

  it("uses empty basePath on matching seller host", () => {
    assert.equal(
      storefrontBasePath("jackos-buns", "jackos-buns.vendl.app"),
      "",
    );
    assert.equal(
      storefrontBasePath("jackos-buns", "jackos-buns.localhost:3000"),
      "",
    );
    assert.equal(
      storefrontBasePath("jackos-buns", "www.farm.com.au"),
      "",
    );
  });

  it("uses /shop/{slug} on apex", () => {
    assert.equal(storefrontBasePath("jackos-buns", "vendl.app"), "/shop/jackos-buns");
    assert.equal(storefrontBasePath("jackos-buns"), "/shop/jackos-buns");
  });

  it("builds return shop URLs", () => {
    assert.equal(
      storefrontReturnShopUrl("jackos-buns", "path"),
      "/shop/jackos-buns/shop",
    );
    assert.match(
      storefrontReturnShopUrl("jackos-buns", "subdomain"),
      /jackos-buns\.(vendl\.app|localhost)/,
    );
  });
});
