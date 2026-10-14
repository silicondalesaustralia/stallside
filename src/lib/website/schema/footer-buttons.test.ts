import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { footerBottomLine, footerColours, footerSettingsProblem, parseFooterSettings } from "@/lib/studio/footer-settings";
import { autoFooterColumns, resolveFooterColumns } from "@/lib/studio/footer-columns";
import { siteButtonVars, siteLinkVars } from "@/lib/storefront/site-buttons";

const palette = { accent: "#2f6b3a", secondary: "#c9a227" };
const ctx = {
  storefrontSlug: "green",
  draft: false,
  basePath: "",
  linkablePages: [{ slug: "faq", href: "/faq" }],
};

describe("footer settings", () => {
  it("parses a saved footer and ignores bad data", () => {
    assert.equal(parseFooterSettings({}), null);
    assert.equal(parseFooterSettings({ footer: { columns: "nope" } }), null);
    assert.deepEqual(parseFooterSettings({ footer: { tagline: "Hi", showEmail: false } }), {
      tagline: "Hi",
      showEmail: false,
    });
  });

  it("keeps a valid phone layout and rejects unknown ones", () => {
    assert.equal(parseFooterSettings({ footer: { mobileLayout: "accordion" } })?.mobileLayout, "accordion");
    assert.equal(parseFooterSettings({ footer: { mobileLayout: "hamburger" } }), null);
  });

  it("explains invalid links in seller words", () => {
    const bad = { columns: [{ id: "a", heading: "Shop", links: [{ id: "l", label: "X", link: "javascript:alert(1)" }] }] };
    assert.match(footerSettingsProblem(bad) ?? "", /isn't a page/);
    assert.equal(footerSettingsProblem({ bottomText: "© {year}" }), null);
  });

  it("fills in the year in custom bottom text", () => {
    assert.equal(footerBottomLine(null, "Green Farm", 2026), "© 2026 Green Farm");
    assert.equal(footerBottomLine({ bottomText: "Since 1990 · {year}" }, "Green Farm", 2026), "Since 1990 · 2026");
  });

  it("only sets colours when chosen, with readable text on a light background", () => {
    assert.equal(footerColours({}, palette), undefined);
    assert.deepEqual(footerColours({ background: "light" }, palette), { background: "#ffffff", color: "var(--field)" });
  });

  it("builds automatic columns with Shop All first and resolves links", () => {
    const cols = autoFooterColumns({
      enabledPages: ["home", "shop", "about", "contact"],
      footerPages: [{ slug: "faq", label: "FAQ", column: "visit" }],
    });
    assert.deepEqual(
      cols.map((c) => [c.heading, c.links.map((l) => l.link)]),
      [
        ["Shop", ["page:shop"]],
        ["Visit & Learn", ["nav:faq"]],
      ],
    );
    const resolved = resolveFooterColumns(
      [...cols, { id: "x", heading: "Gone", links: [{ id: "g", label: "Old", link: "nav:deleted" }] }],
      ctx,
    );
    assert.equal(resolved.length, 2);
    assert.equal(resolved[1]?.links[0]?.href, "/faq");
  });

  it("keeps a column that only has a contact / address block", () => {
    const resolved = resolveFooterColumns(
      [
        { id: "c", heading: "Visit us", links: [], contact: { address: "12 Example Rd\nMacclesfield SA" } },
        { id: "e", heading: "Empty", links: [], contact: { address: "  " } },
      ],
      ctx,
    );
    assert.deepEqual(
      resolved.map((c) => c.id),
      ["c"],
    );
    assert.equal(resolved[0]?.contact?.address, "12 Example Rd\nMacclesfield SA");
  });
});

describe("site button colours", () => {
  it("sets nothing when unset so templates keep their default", () => {
    assert.deepEqual(siteButtonVars({ background: null, text: null }, palette), {});
  });

  it("uses hex colours and picks readable text automatically", () => {
    assert.deepEqual(siteButtonVars({ background: "accent", text: null }, palette), {
      "--site-btn-bg": "#2f6b3a",
      "--site-btn-ink": "#ffffff",
    });
    assert.deepEqual(siteButtonVars({ background: "#f5f5f5", text: null }, palette), {
      "--site-btn-bg": "#f5f5f5",
      "--site-btn-ink": "#17361f",
    });
    assert.deepEqual(siteButtonVars({ background: null, text: "dark" }, palette), { "--site-btn-ink": "#17361f" });
  });

  it("sets the link colour only when chosen", () => {
    assert.deepEqual(siteLinkVars(null, palette), {});
    assert.deepEqual(siteLinkVars("secondary", palette), { "--site-link": "#c9a227" });
  });
});
