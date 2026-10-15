import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { withLinksRetargeted } from "@/lib/studio/retarget-links";

const redirect = (fromPath: string, toPath: string) => ({ id: fromPath, fromPath, toPath, code: 301, enabled: true });

describe("withLinksRetargeted", () => {
  it("points menu and button links at the new slug, leaving other links alone", () => {
    const raw = {
      headerMenu: { items: [{ id: "a", label: "Eggs", link: "category:old-eggs" }, { id: "b", label: "Shop", link: "page:shop" }] },
      nodes: { btn: { props: { link: "category:old-eggs", text: "category:old-eggs-2" } } },
    };
    const out = withLinksRetargeted(raw, "category", "/", "eggs", ["old-eggs"]);
    assert.deepEqual(out, {
      headerMenu: { items: [{ id: "a", label: "Eggs", link: "category:eggs" }, { id: "b", label: "Shop", link: "page:shop" }] },
      nodes: { btn: { props: { link: "category:eggs", text: "category:old-eggs-2" } } },
    });
  });

  it("repairs links to older slugs that now redirect to the item", () => {
    const raw = {
      storefrontRedirects: [redirect("/first-name", "/eggs"), redirect("/elsewhere", "/about")],
      footer: [{ link: "category:first-name" }, { link: "category:elsewhere" }],
    };
    const out = withLinksRetargeted(raw, "category", "/", "eggs");
    assert.deepEqual(out.footer, [{ link: "category:eggs" }, { link: "category:elsewhere" }]);
  });

  it("matches product links under their path prefix", () => {
    const raw = { storefrontRedirects: [redirect("/products/dozen", "/products/dozen-eggs")], link: "product:dozen" };
    assert.equal(withLinksRetargeted(raw, "product", "/products/", "dozen-eggs").link, "product:dozen-eggs");
  });
});
