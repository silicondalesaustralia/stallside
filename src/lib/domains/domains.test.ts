import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isLikelyApexHostname,
  isValidCustomHostname,
  normalizeDomainHostname,
} from "./normalize";
import {
  getCanonicalStorefrontUrl,
  getStorefrontOrigin,
  getStorefrontUrl,
} from "./preferred-origin";
import { cloudflareHostnameProductionReady } from "./provider/cloudflare";

describe("domains normalize", () => {
  it("strips protocol path and port", () => {
    assert.equal(
      normalizeDomainHostname("https://WWW.Example.com:443/shop?x=1"),
      "www.example.com",
    );
  });

  it("validates hostnames", () => {
    assert.equal(isValidCustomHostname("www.farm.com.au"), true);
    assert.equal(isValidCustomHostname("localhost"), false);
    assert.equal(isValidCustomHostname("bad"), false);
  });

  it("detects likely apex", () => {
    assert.equal(isLikelyApexHostname("example.com"), true);
    assert.equal(isLikelyApexHostname("www.example.com"), false);
    assert.equal(isLikelyApexHostname("shop.example.com"), false);
  });
});

describe("preferred origin", () => {
  it("uses custom primary hostname", () => {
    assert.equal(
      getStorefrontOrigin({
        slug: "green-valley",
        primaryCustomHostname: "www.farm.com.au",
      }),
      "https://www.farm.com.au",
    );
    assert.equal(
      getCanonicalStorefrontUrl(
        { slug: "green-valley", primaryCustomHostname: "www.farm.com.au" },
        "/products/loaf",
      ),
      "https://www.farm.com.au/products/loaf",
    );
  });

  it("falls back to path style when forced", () => {
    const url = getStorefrontUrl(
      { slug: "green-valley", forcePath: true },
      "/shop",
    );
    assert.ok(url.includes("/shop/green-valley/shop"));
  });
});

describe("cloudflare readiness", () => {
  it("requires hostname and ssl active", () => {
    assert.equal(
      cloudflareHostnameProductionReady({
        id: "1",
        hostname: "www.x.com",
        status: "active",
        sslStatus: "active",
        verificationErrors: [],
        ownershipVerification: null,
      }),
      true,
    );
    assert.equal(
      cloudflareHostnameProductionReady({
        id: "1",
        hostname: "www.x.com",
        status: "pending",
        sslStatus: "active",
        verificationErrors: [],
        ownershipVerification: null,
      }),
      false,
    );
  });
});
