import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { listFontPairs } from "@/lib/website/brand-looks";
import { fillUnsetTheme, PLATFORM_THEME_DEFAULTS, resolveWebsiteTheme } from "./resolve-theme";

describe("resolveWebsiteTheme", () => {
  it("falls back to platform defaults", () => {
    assert.deepEqual(resolveWebsiteTheme({}), PLATFORM_THEME_DEFAULTS);
  });

  it("seller beats template beats platform, ignoring blank values", () => {
    const theme = resolveWebsiteTheme({
      template: { skin: "farmhouse", accentColor: "#111111", buttonStyle: "rounded" },
      seller: { accentColor: "#222222", buttonStyle: undefined, secondaryColor: "" },
    });
    assert.equal(theme.skin, "farmhouse");
    assert.equal(theme.accentColor, "#222222");
    assert.equal(theme.buttonStyle, "rounded");
    assert.equal(theme.secondaryColor, PLATFORM_THEME_DEFAULTS.secondaryColor);
  });
});

describe("fillUnsetTheme", () => {
  it("never overrides a seller choice", () => {
    const filled = fillUnsetTheme(
      { accentColor: "#abcdef" },
      { accentColor: "#000000", fontPairId: "artisan-serif" },
    );
    assert.deepEqual(filled, { fontPairId: "artisan-serif" });
  });
});

describe("listFontPairs", () => {
  it("has unique ids", () => {
    const ids = listFontPairs().map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length);
  });
});
