import type { KnowledgeArticle } from "./types";

export const sellingMoreArticles: KnowledgeArticle[] = [
  {
    slug: "product-options",
    title: "Product options (variants)",
    summary:
      "Add size, flavour, or other choices with shared stock - up to three groups per product.",
    videoUrl: null,
    omitVideo: true,
    related: ["upsells", "pre-order-pages", "volume-prices", "first-stand"],
    ctas: [{ label: "Products", href: "/dashboard/products" }],
    steps: [
      "Open a product → Options (variants). Add a group name (e.g. Size) and choices (e.g. Small, Large).",
      "You can have up to 3 groups and 12 choices per group. Stock stays on the product - options do not get separate stock counts.",
      "With one group, each choice price is the full unit price (leave 0 to use the product price). With multiple groups, choice prices are add-ons on top of the product price.",
      "Save options, then open the public product page and confirm buyers must pick a choice before adding to cart.",
      "Volume / bundle prices and options cannot be used on the same product - clear one before enabling the other.",
      "On a pre-order page, products with options still work: buyers open the product page to choose, then return to checkout for that collection day.",
    ],
  },
  {
    slug: "upsells",
    title: "Cart upsells and pre-order add-ons",
    summary:
      "Offer one extra item in take-now carts, or a page-level add-on on a pre-order sheet.",
    videoUrl: null,
    omitVideo: true,
    related: ["pre-order-pages", "product-options", "stand-branding", "volume-prices"],
    ctas: [
      { label: "Pre-order pages", href: "/dashboard/pre-order-pages" },
      { label: "My Businesses", href: "/dashboard/businesses" },
    ],
    steps: [
      "Take-now upsells: open My Businesses → your business → Upsells. Pick a catalogue product to offer when someone has a take-now cart, and optionally set a special upsell price.",
      "Override per product: on a take-now product, Cart upsell (take-now) can point at a different add-on. That overrides the business default for carts that include that product.",
      "Pre-order add-ons are different: edit a pre-order page and fill Pre-order add-on (name, price, optional discount). The offer appears on that page’s cart and uses the same collection day and payment rules.",
      "Buyers see the offer on the cart step and can add it once. It shows as an upsell line at checkout.",
      "Also on the business Upsells tab: optional first-order discount (percent or fixed amount for a new buyer email) and Show “Only N left” when stock is low.",
      "Test with a second phone: add an item, confirm the upsell or add-on card appears, add it, and complete a small card payment.",
    ],
  },
  {
    slug: "volume-prices",
    title: "Volume / bundle prices",
    summary:
      "Exact quantity totals (e.g. 2 for $9) on a product - not available together with options.",
    videoUrl: null,
    omitVideo: true,
    related: ["product-options", "pre-order-pages", "upsells"],
    ctas: [{ label: "Products", href: "/dashboard/products" }],
    steps: [
      "Open a product with no option groups. Use volume / bundle price fields for exact quantity totals (for example 2 for $9, 6 for $24).",
      "These are fixed totals for that quantity, not a % off. They show on the public product and can appear on your QR poster if that block is enabled.",
      "Clear volume prices before adding Options (variants) - the two features cannot run on the same product.",
      "On pre-order pages, volume breaks still apply to eligible products on that sheet.",
    ],
  },
  {
    slug: "restock-emails",
    title: "Notify customers of a restock",
    summary:
      "Shoppers can opt in after checkout; you send one restock email without ever seeing their addresses.",
    videoUrl: null,
    omitVideo: true,
    related: ["email-customers", "alerts-push", "first-stand"],
    ctas: [{ label: "Products", href: "/dashboard/products" }],
    steps: [
      "After checkout, customers can opt in to restock alerts for your stand. You never see the subscriber list - Vendl keeps emails private.",
      "When you have restocked, open Products. If people are waiting, a restock panel appears with the subscriber count.",
      "Send the restock notice from that panel. Buyers get an email that you have stock again, with a link back to your stall.",
      "There is a cooldown between sends so you do not spam the same list. Sale and low-stock alerts to you stay under Settings → Alerts.",
    ],
  },
];
