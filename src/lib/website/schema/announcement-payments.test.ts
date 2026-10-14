import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_ANNOUNCEMENT_BAR,
  announcementBarProblem,
  announcementColours,
  isAnnouncementVisible,
  parseAnnouncementBar,
} from "@/lib/studio/announcement-bar";
import { SECTION_REGISTRY, vendlTypeForCraftName } from "@/lib/website/sections/registry";

const palette = { accent: "#2f6b3a", secondary: "#f4c430" };

describe("announcement bar", () => {
  it("parses saved bars and ignores invalid ones", () => {
    assert.deepEqual(parseAnnouncementBar({ announcementBar: DEFAULT_ANNOUNCEMENT_BAR }), DEFAULT_ANNOUNCEMENT_BAR);
    assert.equal(parseAnnouncementBar({ announcementBar: { enabled: true, text: "x", link: "javascript:x" } }), null);
    assert.equal(parseAnnouncementBar({}), null);
  });

  it("only shows when switched on with text", () => {
    assert.equal(isAnnouncementVisible(null), false);
    assert.equal(isAnnouncementVisible({ enabled: false, text: "Hi" }), false);
    assert.equal(isAnnouncementVisible({ enabled: true, text: "  " }), false);
    assert.equal(isAnnouncementVisible({ enabled: true, text: "Hi" }), true);
  });

  it("explains what stops it saving", () => {
    assert.match(announcementBarProblem({ enabled: true, text: "" }) ?? "", /announcement text/);
    assert.equal(announcementBarProblem({ enabled: false, text: "" }), null);
    assert.match(announcementBarProblem({ enabled: true, text: "Hi", linkLabel: "Go" }) ?? "", /where the link goes/);
  });

  it("picks readable text for the background unless chosen", () => {
    assert.deepEqual(announcementColours({ enabled: true, text: "x" }, palette), { background: "var(--field)", color: "#ffffff" });
    assert.equal(announcementColours({ enabled: true, text: "x", background: "light" }, palette).color, "var(--field)");
    assert.equal(announcementColours({ enabled: true, text: "x", background: "light", textColour: "#ff0000" }, palette).color, "#ff0000");
  });
});

describe("payment options section", () => {
  it("is registered and validates its settings", () => {
    assert.equal(vendlTypeForCraftName("CraftPaymentsSection"), "payments");
    const settings = SECTION_REGISTRY.payments.settings;
    assert.equal(settings.safeParse({ layout: "bar", showLabels: true }).success, true);
    assert.equal(settings.safeParse({ layout: "carousel" }).success, false);
  });
});
