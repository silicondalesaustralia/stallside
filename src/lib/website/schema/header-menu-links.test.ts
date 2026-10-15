import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isButtonLink, resolveButtonLink } from "@/lib/studio/button-link";
import { siteHeaderVars } from "@/lib/storefront/site-header-colours";
import { parseSiteStyle } from "@/lib/storefront/site-style";
import { colourHex } from "@/lib/website/sections/colour";

const palette = { accent: "#2f6b3a", secondary: "#b5542f" };

describe("header menu links and colours", () => {
  it("links to a single category page", () => {
    assert.ok(isButtonLink("category:free-range-eggs"));
    assert.equal(isButtonLink("category:bad slug"), false);
    const href = resolveButtonLink("category:eggs", { storefrontSlug: "alexa", draft: false, basePath: "" });
    assert.ok(href?.endsWith("/eggs"));
  });

  it("keeps template header colours until the seller picks some", () => {
    assert.deepEqual(siteHeaderVars({}, palette), {});
  });

  it("picks readable text for a dark header background", () => {
    const style = parseSiteStyle({ headerBackground: "dark" });
    const vars = siteHeaderVars(style, palette);
    assert.equal(vars["--panel"], colourHex("dark", palette));
    assert.equal(vars["--field"], colourHex("light", palette));
  });

  it("uses the seller's text colour when set", () => {
    const vars = siteHeaderVars(parseSiteStyle({ headerBackground: "light", headerText: "#123456" }), palette);
    assert.equal(vars["--field"], "#123456");
  });
});
