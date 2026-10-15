import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { elementCss } from "@/lib/website/sections/element-style";
import { parseElementStyles } from "@/lib/website/sections/element-style-schema";
import { sectionStyleFrame } from "@/lib/website/sections/section-style-frame";
import { parseSectionStyle } from "@/lib/website/sections/section-style";

const palette = { accent: "#2f6f3e", secondary: "#f4d35e" };

describe("parseElementStyles", () => {
  it("keeps valid fields and drops bad ones", () => {
    const parsed = parseElementStyles({
      price: { colour: "#aa0000", size: "xl", font: "comic", weight: "700" },
      "bad id": { colour: "#000000" },
      empty: { size: "huge" },
    });
    assert.deepEqual(parsed, { price: { colour: "#aa0000", size: "xl", weight: "700" } });
  });

  it("returns undefined when nothing is set", () => {
    assert.equal(parseElementStyles({}), undefined);
    assert.equal(parseElementStyles("x"), undefined);
  });

  it("is read through parseSectionStyle", () => {
    const style = parseSectionStyle({ elements: { bullets: { italic: true } } });
    assert.deepEqual(style.elements, { bullets: { italic: true } });
  });
});

describe("elementCss", () => {
  it("turns settings into inline CSS", () => {
    const css = elementCss({ colour: "accent", size: "sm", font: "mono", italic: true, textCase: "upper" }, palette);
    assert.equal(css.color, "var(--leaf)");
    assert.equal(css.fontSize, "0.875rem");
    assert.match(css.fontFamily ?? "", /monospace/);
    assert.equal(css.fontStyle, "italic");
    assert.equal(css.textTransform, "uppercase");
  });
});

describe("section heading and text colours", () => {
  it("text colour no longer recolours headings", () => {
    const frame = sectionStyleFrame({ textColour: "#112233" }, palette);
    assert.equal(frame.style["--ink"], "#112233");
    assert.equal(frame.style["--field"], undefined);
  });

  it("heading colour sets only headings", () => {
    const frame = sectionStyleFrame({ headingColour: "#445566" }, palette);
    assert.equal(frame.style["--field"], "#445566");
    assert.equal(frame.style["--ink"], undefined);
    assert.match(frame.className, /section-style--heading/);
  });

  it("a dark background still gets readable headings and text", () => {
    const frame = sectionStyleFrame({ background: "dark" }, palette);
    assert.ok(frame.style["--field"]);
    assert.equal(frame.style["--field"], frame.style["--ink"]);
  });
});
