import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
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
});
