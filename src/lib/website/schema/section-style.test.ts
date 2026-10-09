import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { contrastRatio, hasLowContrast, resolvedTextColour } from "@/lib/website/sections/colour";
import { countPageH1, h1Warning } from "@/lib/website/sections/heading-outline";
import { sectionStyleFrame } from "@/lib/website/sections/section-style-frame";
import { isColourValue, parseSectionStyle } from "@/lib/website/sections/section-style";
import { validateSection } from "@/lib/website/sections/validate-section";
import type { SectionInstance } from "./definition";
import { hasErrors } from "./diagnostics";

const palette = { accent: "#2f6f3e", secondary: "#f4d35e" };

function hero(settings: Record<string, unknown>): SectionInstance {
  return {
    id: "s1",
    type: "hero",
    schemaVersion: 1,
    variant: "background",
    visibility: "public",
    content: { headline: "Hello" },
    settings,
  };
}

describe("section style values", () => {
  it("accepts theme tokens and #rrggbb only", () => {
    assert.ok(isColourValue("accent"));
    assert.ok(isColourValue("#A1b2C3"));
    assert.equal(isColourValue("red"), false);
    assert.equal(isColourValue("#fff"), false);
    assert.equal(isColourValue("url(x)"), false);
  });

  it("drops invalid fields and keeps valid ones", () => {
    assert.deepEqual(parseSectionStyle({ background: "dark", headingTag: "h7", headingSize: "xl" }), {
      background: "dark",
      headingSize: "xl",
    });
    assert.deepEqual(parseSectionStyle("nope"), {});
  });

  it("validates as part of section settings", () => {
    const ok = hero({ style: { background: "accent", headingTag: "h3" } });
    assert.equal(hasErrors(validateSection(ok, "home", "s")), false);
    assert.ok(hasErrors(validateSection(hero({ style: { background: "javascript:1" } }), "home", "s")));
  });
});

describe("section colours", () => {
  it("measures WCAG contrast", () => {
    assert.equal(Math.round(contrastRatio("#000000", "#ffffff")), 21);
    assert.equal(contrastRatio("#777777", "#777777"), 1);
  });

  it("picks readable text for the background when text is Auto", () => {
    assert.equal(resolvedTextColour({ background: "dark" }, palette), "light");
    assert.equal(resolvedTextColour({ background: "secondary" }, palette), "dark");
    assert.equal(resolvedTextColour({}, palette), null);
    assert.equal(resolvedTextColour({ textColour: "accent" }, palette), "accent");
  });

  it("warns on low contrast only", () => {
    assert.ok(hasLowContrast({ background: "light", textColour: "wash" }, palette));
    assert.equal(hasLowContrast({ background: "dark" }, palette), false);
  });

  it("frames the section with theme variable overrides", () => {
    const frame = sectionStyleFrame({ background: "dark", headingSize: "lg" }, palette);
    assert.match(frame.className, /section-style--bg/);
    assert.match(frame.className, /section-style--ink/);
    assert.equal(frame.style["--section-bg"], "var(--field)");
    assert.equal(frame.style["--field"], "#ffffff");
    assert.equal(frame["data-heading-size"], "lg");
    assert.deepEqual(sectionStyleFrame({}, palette).style, {});
  });
});

describe("heading outline", () => {
  it("counts H1s from defaults and overrides", () => {
    const sections = [
      { craftName: "CraftHeroSection", style: undefined },
      { craftName: "CraftTextSection", style: { headingTag: "h1" } },
      { craftName: "CraftHeroSection", style: { headingTag: "h2" } },
    ];
    assert.equal(countPageH1(sections), 2);
    assert.ok(h1Warning(2));
    assert.ok(h1Warning(0));
    assert.equal(h1Warning(1), null);
  });
});
