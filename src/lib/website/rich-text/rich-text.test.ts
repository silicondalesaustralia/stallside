import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normaliseLinkInput, parseRichText, safeHref } from "./parse";
import { encodeHrefForMarkup, escapeLineStart, escapeRichText, richTextToHtml } from "./serialize";

describe("rich text parsing", () => {
  it("keeps old plain text as the same words, with paragraphs and line breaks", () => {
    assert.deepEqual(parseRichText("Fresh eggs\nDaily\n\nCome by"), [
      { t: "p", c: [{ t: "text", v: "Fresh eggs" }, { t: "br" }, { t: "text", v: "Daily" }] },
      { t: "p", c: [{ t: "text", v: "Come by" }] },
    ]);
  });

  it("reads bold, italic and links", () => {
    assert.deepEqual(parseRichText("**Big** _news_ [shop](/shop/x)"), [
      {
        t: "p",
        c: [
          { t: "b", c: [{ t: "text", v: "Big" }] },
          { t: "text", v: " " },
          { t: "i", c: [{ t: "text", v: "news" }] },
          { t: "text", v: " " },
          { t: "a", href: "/shop/x", c: [{ t: "text", v: "shop" }] },
        ],
      },
    ]);
  });

  it("reads bullet and numbered lists", () => {
    const [ul, ol] = parseRichText("- Eggs\n- Honey\n\n1. Order\n2. Collect");
    assert.equal(ul?.t, "ul");
    assert.equal(ol?.t, "ol");
    assert.equal(ul?.t === "ul" ? ul.items.length : 0, 2);
  });

  it("leaves snake_case words and unsafe links as text", () => {
    assert.deepEqual(parseRichText("jo_smith_farm"), [{ t: "p", c: [{ t: "text", v: "jo_smith_farm" }] }]);
    const [p] = parseRichText("[x](javascript:alert(1))");
    assert.ok(p?.t === "p" && p.c.every((n) => n.t === "text"));
  });

  it("round-trips escaped characters", () => {
    const typed = "Use *code* and [brackets] \\ here";
    assert.deepEqual(parseRichText(escapeRichText(typed)), [{ t: "p", c: [{ t: "text", v: typed }] }]);
    assert.equal(parseRichText(escapeLineStart("- not a list"))[0]?.t, "p");
    assert.equal(parseRichText(escapeLineStart("2024. A good year"))[0]?.t, "p");
  });
});

describe("rich text links and html", () => {
  it("allows only safe link targets", () => {
    assert.equal(safeHref("https://vendl.app"), "https://vendl.app");
    assert.equal(safeHref("mailto:jo@farm.com"), "mailto:jo@farm.com");
    assert.equal(safeHref("/shop/eggs"), "/shop/eggs");
    assert.equal(safeHref("javascript:alert(1)"), null);
    assert.equal(safeHref("//evil.com"), null);
    assert.equal(safeHref("data:text/html,x"), null);
  });

  it("normalises what sellers type", () => {
    assert.equal(normaliseLinkInput("www.farm.com.au"), "https://www.farm.com.au");
    assert.equal(normaliseLinkInput("jo@farm.com"), "mailto:jo@farm.com");
    assert.equal(normaliseLinkInput("not a link"), null);
  });

  it("escapes everything in editor html", () => {
    const html = richTextToHtml(parseRichText(`<script>x</script> [a"b](https://x.com/?q="y")`));
    assert.ok(!html.includes("<script>"));
    assert.ok(html.includes("&lt;script&gt;"));
    assert.ok(!/href="[^"]*"[^>]*"/.test(html.replace(/&quot;/g, "")));
  });

  it("encodes brackets in hrefs so links survive", () => {
    const href = encodeHrefForMarkup("https://x.com/a(b) c");
    const [p] = parseRichText(`[go](${href})`);
    assert.ok(p?.t === "p" && p.c[0]?.t === "a");
  });
});
