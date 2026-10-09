import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applySelectedPagesToDraft, FAQ_PAGE_ID } from "./apply-selected-pages";
import { ensureCustomPages } from "@/lib/studio/custom-pages";
import { ensureBlogSettings } from "@/lib/studio/blog";
import { buildStudioHeaderNav } from "@/lib/studio/navigation";

describe("apply selected pages", () => {
  it("enables FAQ, blog and policies from selection", () => {
    const raw = applySelectedPagesToDraft(
      {},
      ["HOME", "ABOUT", "CONTACT", "FAQ", "BLOG", "PRIVACY", "TERMS"],
      ["SHOP"],
    );
    const pages = ensureCustomPages(raw);
    assert.equal(pages.find((p) => p.builtinKey === "about")?.enabled, true);
    assert.equal(pages.find((p) => p.builtinKey === "contact")?.showInNav, true);
    assert.equal(pages.find((p) => p.id === FAQ_PAGE_ID)?.enabled, true);
    assert.equal(pages.find((p) => p.builtinKey === "privacy")?.enabled, true);
    assert.equal(pages.find((p) => p.builtinKey === "returns")?.enabled, false);
    assert.equal(ensureBlogSettings(raw).enabled, true);
    assert.equal(ensureBlogSettings(raw).showInNav, true);

    const nav = buildStudioHeaderNav(
      pages,
      ensureBlogSettings(raw),
      "demo",
    );
    assert.ok(nav.some((i) => i.slug === "about"));
    assert.ok(nav.some((i) => i.slug === "faq" || i.children));
    const policies = nav.find((i) => i.slug === "policies");
    assert.ok(policies?.children && policies.children.length >= 2);
  });
});
