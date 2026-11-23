import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isAllowedStitchstackScriptSrc,
  parseStitchstackPixelPayload,
  readStitchstackPixel,
} from "./stitchstack-pixel";

describe("stitchstack pixel", () => {
  it("accepts https script on stitchstack.app and rejects others", () => {
    assert.equal(
      isAllowedStitchstackScriptSrc(
        "https://stitchstack.app/api/attribution/script?orgId=a&siteId=b",
      ),
      true,
    );
    assert.equal(isAllowedStitchstackScriptSrc("http://stitchstack.app/x"), false);
    assert.equal(isAllowedStitchstackScriptSrc("https://evil.example/x.js"), false);
  });

  it("parses ensure payload and builds script_src when omitted", () => {
    const pixel = parseStitchstackPixelPayload({
      org_id: "org_1",
      site_id: "site_1",
      view_id: "view_1",
    });
    assert.ok(pixel);
    assert.equal(pixel.orgId, "org_1");
    assert.equal(pixel.siteId, "site_1");
    assert.equal(pixel.viewId, "view_1");
    assert.ok(pixel.scriptSrc.includes("orgId=org_1"));
    assert.ok(pixel.scriptSrc.includes("siteId=site_1"));
    assert.equal(pixel.enabled, true);
  });

  it("reads stored config and drops disabled or bad hosts", () => {
    const ok = readStitchstackPixel({
      orgId: "o",
      siteId: "s",
      scriptSrc: "https://stitchstack.app/api/attribution/script?orgId=o&siteId=s",
      enabled: true,
      installedAt: "2026-11-23T00:00:00.000Z",
    });
    assert.ok(ok);
    assert.equal(
      readStitchstackPixel({
        orgId: "o",
        siteId: "s",
        scriptSrc: "https://evil.example/x.js",
        enabled: true,
      }),
      null,
    );
  });
});
