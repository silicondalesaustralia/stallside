import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { WebsiteContextAssessment } from "./assess-context";
import { withSavedSelections } from "./saved-selections";

const assessment = {
  pageOptions: [
    { id: "HOME", label: "Home", defaultChecked: true },
    { id: "ABOUT", label: "About", defaultChecked: true },
    { id: "BLOG", label: "Blog", defaultChecked: false },
  ],
  capabilityOptions: [
    { id: "SHOP", label: "Shop", defaultChecked: true },
    { id: "PICKUP", label: "Pickup", defaultChecked: false },
    { id: "LOCKED", label: "Locked", defaultChecked: false, disabled: true },
  ],
} as unknown as WebsiteContextAssessment;

const checked = (opts: { id: string; defaultChecked: boolean }[]) =>
  opts.filter((o) => o.defaultChecked).map((o) => o.id);

describe("withSavedSelections", () => {
  it("ticks the saved pages and capabilities instead of the defaults", () => {
    const out = withSavedSelections(assessment, {
      selectedPages: ["BLOG"],
      selectedCapabilities: ["PICKUP", "LOCKED"],
    } as Parameters<typeof withSavedSelections>[1]);
    assert.deepEqual(checked(out.pageOptions), ["HOME", "BLOG"]);
    assert.deepEqual(checked(out.capabilityOptions), ["PICKUP"]);
  });

  it("keeps the defaults when nothing was saved", () => {
    assert.equal(withSavedSelections(assessment, undefined), assessment);
    const out = withSavedSelections(assessment, {});
    assert.deepEqual(checked(out.pageOptions), ["HOME", "ABOUT"]);
  });
});
