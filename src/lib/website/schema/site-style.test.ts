import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SITE_FONTS, siteFont } from "@/lib/storefront/site-fonts";
import { parseSiteStyle, siteStyleSchema } from "@/lib/storefront/site-style";
import { siteFontHrefs, siteLayoutVars, siteStyleAttrs, siteThemeVars } from "@/lib/storefront/site-style-vars";
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

  it("maps corners, buttons, headings, margins, cards and effects", () => {
    const style = parseSiteStyle({
      sideMargins: "wide",
      corners: "square",
      buttonShape: "pill",
      buttonSize: "lg",
      headingWeight: "800",
      headingCase: "upper",
      headingTracking: "wide",
      productRatio: "portrait",
      cardHover: "zoom",
      animation: "fade",
      dividers: "alternate",
      headerScroll: "scroll",
    });
    assert.deepEqual(siteLayoutVars(style), {
      "--gutter-scale": "1.75",
      "--studio-card-radius": "0",
      "--site-btn-radius": "9999px",
      "--studio-btn-height": "3.375rem",
      "--site-btn-px": "2rem",
      "--site-btn-font": "1.0625rem",
      "--studio-heading-weight": "800",
      "--studio-heading-tracking": "0.06em",
      "--site-heading-case": "uppercase",
    });
    assert.deepEqual(siteStyleAttrs(style), {
      "data-site-heading-style": "",
      "data-site-btn-shape": "pill",
      "data-site-product-ratio": "portrait",
      "data-site-card-hover": "zoom",
      "data-site-animate": "fade",
      "data-site-dividers": "alternate",
    });
    assert.equal(parseSiteStyle({ headingWeight: "900", corners: "blob" }).headingWeight, undefined);
  });

  it("adds nothing when everything is the template default", () => {
    assert.deepEqual(siteThemeVars({}, palette), {});
    assert.deepEqual(siteLayoutVars({ contentWidth: "standard", sectionSpacing: "standard", sideMargins: "standard" }), {});
    assert.deepEqual(siteStyleAttrs({ animation: "none", dividers: "none" }), {});
  });
});
