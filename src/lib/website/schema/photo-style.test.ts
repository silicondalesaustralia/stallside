import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parsePhotoStyle, photoVars } from "@/lib/website/sections/photo-style";
import { parseSectionStyle } from "@/lib/website/sections/section-style";
import { parseSiteStyle } from "@/lib/storefront/site-style";

describe("photo style", () => {
  it("emits nothing when unset, so template defaults stay", () => {
    assert.deepEqual(photoVars({}), {});
  });

  it("maps fit, focus and shape to CSS variables", () => {
    assert.deepEqual(photoVars({ photoFit: "contain", photoFocus: "top", photoShape: "square" }), {
      "--photo-fit": "contain",
      "--photo-focus": "50% 0%",
      "--photo-ratio": "1 / 1",
      "--photo-box-ratio": "1 / 1",
    });
  });

  it("lets original-shape photos keep their own ratio", () => {
    assert.deepEqual(photoVars({ photoShape: "original" }), { "--photo-ratio": "auto" });
  });

  it("drops unknown values from section and site styles", () => {
    assert.deepEqual(parsePhotoStyle({ photoFit: "stretch", photoFocus: "bottom" }), { photoFocus: "bottom" });
    assert.equal(parseSectionStyle({ photoShape: "wide" }).photoShape, "wide");
    assert.equal(parseSiteStyle({ photoFit: "contain", photoShape: "huge" }).photoFit, "contain");
    assert.equal(parseSiteStyle({ photoShape: "huge" }).photoShape, undefined);
  });
});
