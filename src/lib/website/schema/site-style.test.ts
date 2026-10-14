import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SITE_FONTS, siteFont } from "@/lib/storefront/site-fonts";
import {
  parseSiteStyle,
  siteFontHrefs,
  siteLayoutVars,
  siteStyleAttrs,
  siteStyleSchema,
  siteThemeVars,
} from "@/lib/storefront/site-style";
import type { ThemePalette } from "@/lib/website/sections/colour";

const palette = { accent: "#2f6f3e", secondary: "#c58b2b", dark: "#17361f", light: "#ffffff" } as unknown as ThemePalette;

describe("site fonts", () => {
  it("lists each Google font once, with a family and stylesheet", () => {
    const fraunces = siteFont("fraunces");
    assert.ok(fraunces);
    assert.equal(fraunces.kind, "Serif");
    assert.match(fraunces.family, /"Fraunces"/);
    assert.match(fraunces.href, /^https:\/\/fonts\.googleapis\.com\/css2\?family=Fraunces:/);
    assert.equal(siteFont("outfit")?.kind, "Sans serif");
    assert.equal(new Set(SITE_FONTS.map((f) => f.id)).size, SITE_FONTS.length);
  });
});

describe("site style", () => {
  it("keeps valid fields and drops bad ones", () => {
    assert.deepEqual(parseSiteStyle({ headingFont: "fraunces", bodyFont: "comic-sans", contentWidth: "full", headingSize: "huge" }), {
      headingFont: "fraunces",
      contentWidth: "full",
    });
    assert.deepEqual(parseSiteStyle("nope"), {});
    assert.equal(siteStyleSchema.strict().safeParse({ bodyFont: "comic-sans" }).success, false);
  });

  it("turns settings into CSS variables and attributes", () => {
    const style = parseSiteStyle({
      headingFont: "fraunces",
      bodyFont: "outfit",
      headingColour: "#112233",
      textColour: "#445566",
      contentWidth: "full",
      sectionSpacing: "compact",
      headingSize: "lg",
    });
    const theme = siteThemeVars(style, palette);
    assert.match(theme["--font-display"] ?? "", /Fraunces/);
    assert.match(theme["--font-body"] ?? "", /Outfit/);
    assert.equal(theme["--field"], "#112233");
    assert.equal(theme["--ink"], "#445566");
    assert.deepEqual(siteLayoutVars(style), {
      "--studio-content-max": "100%",
      "--studio-section-py": "2.25rem",
      "--studio-section-py-mobile": "1.75rem",
    });
    assert.deepEqual(siteStyleAttrs(style), { "data-site-heading-size": "lg" });
    assert.equal(siteFontHrefs(style).length, 2);
  });

  it("adds nothing when everything is the template default", () => {
    assert.deepEqual(siteThemeVars({}, palette), {});
    assert.deepEqual(siteLayoutVars({ contentWidth: "standard", sectionSpacing: "standard" }), {});
    assert.deepEqual(siteStyleAttrs({}), {});
  });
});
