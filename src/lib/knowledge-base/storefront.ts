import type { KnowledgeArticle } from "./types";

export const storefrontArticles: KnowledgeArticle[] = [
  {
    slug: "pre-orders",
    title: "Pre-orders and collections",
    summary:
      "Take card deposits for future pickups, keep take-now and pre-order checkouts separate, and manage who is collecting when.",
    videoUrl: null,
    omitVideo: true,
    related: ["stand-branding", "customer-payments", "first-stand"],
    ctas: [
      { label: "Products", href: "/dashboard/products" },
      { label: "Collections", href: "/dashboard/collections" },
    ],
    steps: [
      "Pre-orders need Stripe connected so customers can pay to reserve. Available on your free trial and on Stallside Pro.",
      "On a product, turn on Pre-order and set the order-by deadline and collection date/time. Optionally show exact slots left publicly. Add a short collection note if buyers need directions.",
      "Stock on a pre-order product is the number of orders you will take — each paid order counts against that cap. Duplicate a product to reuse settings, hide it from the stand page while keeping the direct link live, or archive it to bring back later.",
      "Customers browse your stand, add pre-order items, and pay by card only. They enter name, email, and optional phone so you can contact them.",
      "Take-now and pre-order items cannot share one checkout. Different collection days also need separate checkouts.",
      "After payment, the buyer gets an email with order details. You get a sale alert with their name and email.",
      "Open Collections to see paid pre-orders by collection day. Mark each order Ready, then Collected when they pick up.",
      "On Collections or Orders, tap the customer email to send them a message (subject + body) from Stallside. On Collections, use Email all on a collection day to message everyone picking up that day at once.",
    ],
  },
  {
    slug: "stand-branding",
    title: "Logo, colours, and social links",
    summary:
      "Make your public stall and QR poster look like your farm — logo, brand colours, and social icons.",
    videoUrl: null,
    omitVideo: true,
    related: ["pre-orders", "first-stand", "customer-payments"],
    ctas: [{ label: "My stands", href: "/dashboard/stands" }],
    steps: [
      "Branding is available on your free trial and on Stallside Pro. Open My stands → your stand → Branding.",
      "Upload a logo (JPEG, PNG, or WebP). It appears on the public stall header and on your QR poster.",
      "Pick a primary colour for buttons and a secondary colour for prices and stock labels. Use Stallside default to clear a custom colour.",
      "Add Instagram, Facebook, TikTok, YouTube, or website links. Leave a field blank to hide that icon.",
      "Save branding, then open your public stall link (or scan the QR) to check the logo, colours, and social icons.",
      "Print or refresh the QR sign after changing the logo so the poster matches.",
    ],
  },
];
