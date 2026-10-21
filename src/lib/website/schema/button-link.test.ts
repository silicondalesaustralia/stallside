import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isButtonLink, resolveButtonLink } from "@/lib/studio/button-link";
import { SECTION_REGISTRY } from "@/lib/website/sections/registry";

const live = {
  storefrontSlug: "green-acres",
  customNavPages: [{ slug: "events", href: "/shop/green-acres/pages/events", children: [{ slug: "faq", href: "/x/faq" }] }],
};

describe("button links", () => {
  it("accepts page, custom page, product and safe web tokens only", () => {
    for (const ok of ["page:about", "page:menu", "nav:events", "product:eggs-12", "https://x.com", "mailto:a@b.co", "tel:0400 1", "/shop/x"]) {
      assert.equal(isButtonLink(ok), true, ok);
    }
    for (const bad of ["javascript:alert(1)", "page:admin", "nav:", "//evil.com", "data:text/html,x", 5]) {
      assert.equal(isButtonLink(bad), false, String(bad));
    }
  });

  it("resolves tokens for the live site and the draft editor", () => {
    assert.equal(resolveButtonLink("page:about", live), "/shop/green-acres/about");
    assert.equal(resolveButtonLink("product:eggs", live), "/shop/green-acres/products/eggs");
    assert.equal(resolveButtonLink("product:eggs", { ...live, draft: true }), "/shop/green-acres/products/eggs?draft=1");
    assert.equal(resolveButtonLink("nav:faq", live), "/x/faq");
    assert.equal(resolveButtonLink("https://x.com", live), "https://x.com");
  });

  it("resolves subscription, membership and pre-order pages", () => {
    assert.equal(resolveButtonLink("page:subscriptions", live), "/shop/green-acres/subscriptions");
    assert.equal(resolveButtonLink("offer:veg-box", live), "/shop/green-acres/subscriptions/veg-box");
    assert.equal(resolveButtonLink("preorder:xmas-hams", { ...live, draft: true }), "/shop/green-acres/pre-orders/xmas-hams?draft=1");
  });

  it("falls back to the section default when unset, invalid or the page is gone", () => {
    assert.equal(resolveButtonLink(undefined, live), null);
    assert.equal(resolveButtonLink("javascript:alert(1)", live), null);
    assert.equal(resolveButtonLink("nav:deleted", live), null);
  });

  it("validates buttonLink on every section", () => {
    const hero = SECTION_REGISTRY.hero.settings.partial();
    assert.equal(hero.safeParse({ buttonLink: "page:contact" }).success, true);
    assert.equal(hero.safeParse({ buttonLink: "javascript:x" }).success, false);
  });
});
