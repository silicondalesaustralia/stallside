import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  betaStandRedirectsEnabled,
  isBetaOwner,
  websiteOrigin,
  websitePathFor,
  websiteStandId,
} from "./beta-stand-redirect-rules";

const KEYS = ["BETA_APP_URL", "LEGACY_STAND_REDIRECTS"] as const;
const saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe("beta stand redirects", () => {
  it("needs the beta hand-off and no kill switch", () => {
    delete process.env.BETA_APP_URL;
    assert.equal(betaStandRedirectsEnabled(), false);
    process.env.BETA_APP_URL = "https://beta.vendl.app";
    assert.equal(betaStandRedirectsEnabled(), true);
    process.env.LEGACY_STAND_REDIRECTS = "off";
    assert.equal(betaStandRedirectsEnabled(), false);
  });

  it("only applies to beta owners", () => {
    assert.equal(isBetaOwner(["beta"]), true);
    assert.equal(isBetaOwner([]), false);
  });

  it("maps old stand pages to website paths", () => {
    assert.equal(websitePathFor({ kind: "home" }), "/");
    assert.equal(websitePathFor({ kind: "cart" }), "/cart");
    assert.equal(websitePathFor({ kind: "category", categorySlug: "Soaps" }), "/soaps");
    assert.equal(websitePathFor({ kind: "preOrder", pageSlug: "spring" }), "/pre-orders/spring");
    assert.equal(websitePathFor({ kind: "subscription", offerSlug: "herd-share" }), "/subscriptions/herd-share");
    assert.equal(websitePathFor({ kind: "product", productSlug: "eggs" }), "/products/eggs");
    assert.equal(websitePathFor({ kind: "product", productSlug: "eggs" }, false), "/shop");
  });

  it("prefers the primary custom domain", () => {
    assert.equal(websiteOrigin("fletcherbrook", null), "https://fletcherbrook.vendl.app");
    assert.equal(websiteOrigin("fletcherbrook", "fletcherbrook.com.au"), "https://fletcherbrook.com.au");
  });

  it("uses the chosen website stand, else the oldest", () => {
    assert.equal(websiteStandId(["a", "b"], { websiteStandId: "b" }), "b");
    assert.equal(websiteStandId(["a", "b"], { websiteStandId: "gone" }), "a");
    assert.equal(websiteStandId(["a"], {}), "a");
  });
});
