import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeTrackingId, normalizeTrackingIds } from "./normalize";
import { extractStorefrontTracking, mergeStorefrontTrackingIntoRaw, trackingMatches } from "./config";
import { parseCustomHeadCode } from "./custom-code";
import { consentRequired, trackingAllowed } from "./consent";
import { pixelSnippets } from "./snippets-pixels";
import { googleBootstrapSnippet } from "./snippets-google";
import { enabledPrivacyProviders } from "./privacy-providers";
import { DEFAULT_STOREFRONT_TRACKING } from "./types";

const ok = (value: string) => ({ value });

describe("tracking id normalisation", () => {
  it("accepts bare ids and fixes case", () => {
    assert.deepEqual(normalizeTrackingId("ga4Id", " g-abc123xyz "), ok("G-ABC123XYZ"));
    assert.deepEqual(normalizeTrackingId("metaPixelId", "123456789012345"), ok("123456789012345"));
  });

  it("pulls ids out of pasted snippets and meta tags", () => {
    assert.deepEqual(normalizeTrackingId("metaPixelId", "fbq('init', '123456789012345');"), ok("123456789012345"));
    assert.deepEqual(normalizeTrackingId("tiktokPixelId", "ttq.load('cabcdefghij123456789');"), ok("CABCDEFGHIJ123456789"));
    assert.deepEqual(
      normalizeTrackingId("gscVerification", '<meta name="google-site-verification" content="AbC_def-1234567890xyzQ" />'),
      ok("AbC_def-1234567890xyzQ"),
    );
    assert.deepEqual(normalizeTrackingId("pinterestTagId", "pintrk('load', '2612345678901');"), ok("2612345678901"));
  });

  it("explains Universal Analytics ids and rejects junk", () => {
    const ua = normalizeTrackingId("ga4Id", "UA-12345-1");
    assert.ok("error" in ua && ua.error.includes("Universal Analytics"));
    assert.ok("error" in normalizeTrackingId("metaPixelId", "<script>alert(1)</script>"));
  });

  it("empty clears the id", () => {
    assert.deepEqual(normalizeTrackingId("gtmId", "  "), { value: null });
  });

  it("splits a pasted Google Ads send_to into id and label", () => {
    const { ids, errors } = normalizeTrackingIds({ googleAdsId: "AW-123456789/AbC-dEf_12", googleAdsPurchaseLabel: "" });
    assert.deepEqual(errors, {});
    assert.equal(ids.googleAdsId, "AW-123456789");
    assert.equal(ids.googleAdsPurchaseLabel, "AbC-dEf_12");
  });

  it("does not treat a bare Google Ads id as a label", () => {
    const { ids } = normalizeTrackingIds({ googleAdsId: "AW-123456789", googleAdsPurchaseLabel: "" });
    assert.equal(ids.googleAdsPurchaseLabel, undefined);
  });
});

describe("tracking config", () => {
  it("defaults when missing and drops invalid stored ids", () => {
    const raw = { storefrontTracking: { ids: { ga4Id: "G-ABCD1234", metaPixelId: "');alert(1);//" }, consentMode: "nope" } };
    const t = extractStorefrontTracking(raw);
    assert.deepEqual(t.ids, { ga4Id: "G-ABCD1234" });
    assert.equal(t.consentMode, "eu");
    assert.deepEqual(extractStorefrontTracking(null), DEFAULT_STOREFRONT_TRACKING);
  });

  it("round-trips through merge and compares ignoring updatedAt", () => {
    const t = { ...DEFAULT_STOREFRONT_TRACKING, ids: { gtmId: "GTM-ABC123" } };
    const merged = mergeStorefrontTrackingIntoRaw({ other: 1 }, { ...t, updatedAt: "x" });
    assert.equal(merged.other, 1);
    assert.ok(trackingMatches(extractStorefrontTracking(merged), t));
  });
});

describe("custom head code", () => {
  it("keeps https scripts, inline scripts and meta tags", () => {
    const parsed = parseCustomHeadCode(
      '<!-- x --><script async src="https://cdn.example.com/a.js"></script><script>window.x=1</script><meta name="custom-verify" content="abc">',
    );
    assert.deepEqual(parsed.scripts, [{ src: "https://cdn.example.com/a.js", async: true }, { inline: "window.x=1", async: false }]);
    assert.deepEqual(parsed.metas, [{ name: "custom-verify", content: "abc" }]);
    assert.deepEqual(parsed.warnings, []);
  });

  it("skips http scripts, reserved metas, non-JS types and other html", () => {
    const parsed = parseCustomHeadCode(
      '<script src="http://insecure.example.com/a.js"></script><meta name="robots" content="noindex"><script type="text/template">x</script><iframe src="https://x"></iframe>',
    );
    assert.equal(parsed.scripts.length, 0);
    assert.equal(parsed.metas.length, 0);
    assert.equal(parsed.warnings.length, 4);
  });
});

describe("consent", () => {
  it("requires consent by mode and region", () => {
    assert.equal(consentRequired("off", true), false);
    assert.equal(consentRequired("eu", false), false);
    assert.equal(consentRequired("eu", true), true);
    assert.equal(consentRequired("all", false), true);
    assert.equal(trackingAllowed("eu", true, null), false);
    assert.equal(trackingAllowed("eu", true, "granted"), true);
    assert.equal(trackingAllowed("all", false, "denied"), false);
  });

  it("Google bootstrap sets denied defaults before config", () => {
    const code = googleBootstrapSnippet({ ga4Id: "G-ABCD1234" }, true, false);
    assert.ok(code.indexOf("'consent','default'") < code.indexOf("'config'"));
    assert.ok(code.includes('"ad_user_data":"denied"'));
  });
});

describe("snippets and privacy", () => {
  it("builds one loader per configured pixel with JSON-quoted ids", () => {
    const snippets = pixelSnippets({ metaPixelId: "123456789012345", ga4Id: "G-ABCD1234" });
    assert.equal(snippets.length, 1);
    assert.ok(snippets[0].code.includes('fbq(\'init\',"123456789012345")'));
  });

  it("lists cookie-setting providers once, not verification tags", () => {
    const providers = enabledPrivacyProviders({
      ...DEFAULT_STOREFRONT_TRACKING,
      ids: { gscVerification: "AbC_def-1234567890xyzQ", ga4Id: "G-ABCD1234", metaPixelId: "123456789012345" },
    });
    assert.deepEqual(providers.map((p) => p.name), ["Google Analytics", "Meta Pixel (Facebook & Instagram)"]);
  });
});
