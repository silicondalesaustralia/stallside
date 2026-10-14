import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { headerMenuProblem, parseHeaderMenu, resolveHeaderMenu, seedHeaderMenu } from "@/lib/studio/header-menu";

const ctx = {
  storefrontSlug: "green-acres",
  linkablePages: [{ slug: "events", href: "/shop/green-acres/pages/events" }],
};

describe("header menu", () => {
  it("is null (automatic) when missing or invalid", () => {
    assert.equal(parseHeaderMenu({}), null);
    assert.equal(parseHeaderMenu({ headerMenu: { items: [{ id: "a", label: "X", link: "javascript:x" }] } }), null);
  });

  it("resolves links and dropdowns, dropping links to pages that are gone", () => {
    const menu = parseHeaderMenu({
      headerMenu: {
        items: [
          { id: "a", label: "Shop", link: "page:shop" },
          { id: "b", label: "Old", link: "nav:deleted" },
          { id: "c", label: "More", children: [{ id: "d", label: "Events", link: "nav:events" }, { id: "e", label: "Insta", link: "https://instagram.com/x" }] },
        ],
      },
    });
    assert.ok(menu);
    assert.deepEqual(resolveHeaderMenu(menu, ctx), [
      { slug: "a", label: "Shop", href: "/shop/green-acres/shop" },
      {
        slug: "c",
        label: "More",
        href: "/shop/green-acres/pages/events",
        children: [
          { slug: "d", label: "Events", href: "/shop/green-acres/pages/events" },
          { slug: "e", label: "Insta", href: "https://instagram.com/x" },
        ],
      },
    ]);
  });

  it("seeds from the automatic menu, keeping labels and dropdowns", () => {
    const seeded = seedHeaderMenu([
      { slug: "home", label: "Home", href: "/" },
      { slug: "events", label: "Events", href: "/e" },
      { slug: "policies", label: "Policies", href: "/p", children: [{ slug: "terms", label: "Terms", href: "/t" }] },
    ]);
    assert.deepEqual(
      seeded.items.map((i) => [i.label, i.link, i.children?.map((c) => c.link)]),
      [["Home", "page:home", undefined], ["Events", "nav:events", undefined], ["Policies", undefined, ["nav:terms"]]],
    );
    assert.equal(headerMenuProblem(seeded), null);
  });

  it("explains what stops a menu saving", () => {
    assert.match(headerMenuProblem({ items: [{ id: "a", label: " ", link: "page:home" }] }) ?? "", /needs text/);
    assert.match(headerMenuProblem({ items: [{ id: "a", label: "Empty" }] }) ?? "", /needs a link/);
  });
});
