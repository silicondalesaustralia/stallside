import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  LOGO_HEIGHT_MAX,
  LOGO_HEIGHT_MIN,
  clampLogoHeight,
  defaultHeaderStyle,
  headerStyleFromBlueprint,
  isBrandMarkMode,
  isHeaderLayout,
} from "./header-style";

describe("header-style", () => {
  it("defaults to classic and name-only without a logo", () => {
    assert.deepEqual(defaultHeaderStyle(false), {
      headerLayout: "classic",
      brandMark: "name-only",
    });
  });

  it("defaults to logo-and-name when a logo exists", () => {
    assert.deepEqual(defaultHeaderStyle(true), {
      headerLayout: "classic",
      brandMark: "logo-and-name",
    });
  });

  it("maps blueprint header patterns", () => {
    assert.equal(headerStyleFromBlueprint("CENTRED", true).headerLayout, "centred");
    assert.equal(headerStyleFromBlueprint("STACKED", false).headerLayout, "stacked");
    assert.deepEqual(headerStyleFromBlueprint("MINIMAL_ICON", true), {
      headerLayout: "minimal",
      brandMark: "logo-only",
    });
    assert.equal(headerStyleFromBlueprint("BOLD_BAR", true).headerLayout, "classic");
    assert.equal(headerStyleFromBlueprint("INFO_BAR", true).headerLayout, "stacked");
  });

  it("validates layout and brand mark enums", () => {
    assert.equal(isHeaderLayout("classic"), true);
    assert.equal(isHeaderLayout("nope"), false);
    assert.equal(isBrandMarkMode("logo-only"), true);
    assert.equal(isBrandMarkMode("both"), false);
  });

  it("clamps logo height and rejects non-numbers", () => {
    assert.equal(clampLogoHeight(64.4), 64);
    assert.equal(clampLogoHeight(5), LOGO_HEIGHT_MIN);
    assert.equal(clampLogoHeight(999), LOGO_HEIGHT_MAX);
    assert.equal(clampLogoHeight("80"), undefined);
    assert.equal(clampLogoHeight(Number.NaN), undefined);
  });
});
