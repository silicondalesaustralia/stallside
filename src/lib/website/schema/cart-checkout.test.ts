import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shopAllProductsPath, shopCartPath } from "@/lib/storefront/cart-paths";
import { commerceKeyForKind, commerceKindFromParam } from "@/lib/studio/commerce-pages";
import { vendlTypeForCraftName } from "@/lib/website/sections/registry";
import type { SectionInstance, WebsitePage } from "./definition";
import { hasErrors } from "./diagnostics";
import { validatePage } from "./validate";

function section(type: string, visibility: "public" | "hidden" = "public"): SectionInstance {
  return { id: `s-${type}`, type, schemaVersion: 1, variant: "default", visibility, content: {}, settings: {} };
}

function page(kind: string, sections: SectionInstance[]): WebsitePage {
  return { id: `p-${kind}`, kind, slug: kind, title: kind, enabled: true, layoutSource: "sections", sections };
}

describe("cart & checkout URLs", () => {
  it("puts the cart on the website's own address", () => {
    assert.equal(shopCartPath("green-valley", false, ""), "/cart");
    assert.equal(shopCartPath("green-valley"), "/shop/green-valley/cart");
    assert.equal(shopCartPath("green-valley", true), "/shop/green-valley/cart?draft=1");
    assert.equal(shopAllProductsPath("green-valley", false, ""), "/shop");
  });
});

describe("cart & order confirmation layouts", () => {
  it("are editor pages", () => {
    assert.equal(commerceKindFromParam("cart"), "cart");
    assert.equal(commerceKindFromParam("success"), "success");
    assert.equal(commerceKindFromParam("nope"), null);
    assert.equal(commerceKeyForKind("cart"), "commerce-cart");
    assert.equal(commerceKeyForKind("success"), "commerce-success");
  });

  it("map their sections to website types", () => {
    assert.equal(vendlTypeForCraftName("CraftCartSection"), "cart");
    assert.equal(vendlTypeForCraftName("CraftOrderConfirmationSection"), "orderConfirmation");
  });

  it("need their own visible section", () => {
    assert.equal(hasErrors(validatePage(page("cart", [section("cart")]), "p")), false);
    assert.equal(hasErrors(validatePage(page("cart", [section("text"), section("cart", "hidden")]), "p")), true);
    assert.equal(hasErrors(validatePage(page("success", [section("orderConfirmation")]), "p")), false);
  });

  it("keep the cart section off other pages", () => {
    assert.equal(hasErrors(validatePage(page("home", [section("cart")]), "p")), true);
  });
});
