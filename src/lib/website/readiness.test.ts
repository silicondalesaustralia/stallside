import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { websiteReadiness, type ReadinessInput } from "./readiness";

const base: ReadinessInput = {
  hasHeadline: true,
  hasLayout: true,
  productCount: 0,
  canTakeCardPayments: false,
  publishBlockers: [],
  isPublished: false,
};

describe("websiteReadiness", () => {
  it("a content-only site without products or payments is ready to publish", () => {
    const r = websiteReadiness(base);
    assert.equal(r.readyToPublish, true);
    assert.equal(r.complete, false);
  });

  it("example text and a missing layout block publishing", () => {
    assert.equal(websiteReadiness({ ...base, publishBlockers: ["Replace it."] }).readyToPublish, false);
    assert.equal(websiteReadiness({ ...base, hasLayout: false }).readyToPublish, false);
  });

  it("is complete once published", () => {
    assert.equal(websiteReadiness({ ...base, isPublished: true }).complete, true);
  });

  it("shows the first publish blocker as the hint", () => {
    const item = websiteReadiness({ ...base, publishBlockers: ["Replace it."] }).items.find(
      (i) => i.id === "example-text",
    );
    assert.equal(item?.hint, "Replace it.");
  });
});
