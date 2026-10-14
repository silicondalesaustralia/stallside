import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shopAllProductsPath, shopCartPath } from "@/lib/storefront/cart-paths";
import { commerceKeyForKind, commerceKindFromParam } from "@/lib/studio/commerce-pages";
import { vendlTypeForCraftName } from "@/lib/website/sections/registry";
import type { SectionInstance, WebsitePage } from "./definition";
import { hasErrors } from "./diagnostics";
import { validatePage } from "./validate";
import { stripePublishableKeyFor } from "@/lib/stripe-publishable-key";
import { checkoutUiParams } from "@/lib/stripe-embedded-checkout";

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

describe("embedded Stripe checkout", () => {
  it("only uses a browser key from the same account and mode as the secret key", () => {
    const fake = (kind: string, mode: string, account: string) => [kind, mode, `51${account.repeat(14)}x`].join("_");
    const saved = { ...process.env };
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = fake("pk", "live", "A");
    process.env.STRIPE_PUBLISHABLE_KEY_TEST = fake("pk", "test", "B");
    delete process.env.STRIPE_EMBEDDED_CHECKOUT;
    assert.equal(stripePublishableKeyFor(fake("sk", "live", "A")), fake("pk", "live", "A"));
    assert.equal(stripePublishableKeyFor(fake("sk", "test", "B")), fake("pk", "test", "B"));
    assert.equal(stripePublishableKeyFor(fake("sk", "test", "C")), null);
    assert.equal(stripePublishableKeyFor(null), null);
    process.env.STRIPE_EMBEDDED_CHECKOUT = "off";
    assert.equal(stripePublishableKeyFor(fake("sk", "live", "A")), null);
    process.env = saved;
  });

  it("embeds with a return URL, else redirects with success and cancel URLs", () => {
    assert.deepEqual(checkoutUiParams("pk_live_abc", "https://shop.example/checkout/success", "https://x/c"), {
      ui_mode: "embedded_page",
      return_url: "https://shop.example/checkout/success?session_id={CHECKOUT_SESSION_ID}",
    });
    assert.deepEqual(checkoutUiParams(null, "https://shop.example/checkout/success", "https://x/c"), {
      success_url: "https://shop.example/checkout/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://x/c",
    });
  });
});
