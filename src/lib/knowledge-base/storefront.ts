import type { KnowledgeArticle } from "./types";

export const storefrontArticles: KnowledgeArticle[] = [
  {
    slug: "pre-orders",
    title: "Pre-orders overview",
    summary:
      "How Vendl pre-orders work: a shared order window, card payment to reserve, then collect or deliver on the day.",
    videoUrl: null,
    omitVideo: true,
    related: [
      "pre-order-pages",
      "collections-day",
      "email-customers",
      "customer-payments",
      "subscriptions",
    ],
    ctas: [
      { label: "Pre-order pages", href: "/dashboard/pre-order-pages" },
      { label: "Connect Stripe", href: "/dashboard/settings/stripe" },
    ],
    steps: [
      "Pre-orders need Stripe connected so buyers can pay by card to reserve. Available on Free and Pro.",
      "You sell from a pre-order page (one link or QR per collection or delivery day), not from a single product toggle. Mark catalogue products as Available for pre-order pages, then add them to a page.",
      "Each page has an orders-close time, a collection or delivery time, optional note, and either pay in full or a deposit with balance due on handover.",
      "Buyers pay by card only, enter name, email, and optional phone (or delivery address when you choose Deliver).",
      "Take-now stall items and pre-order items cannot share one checkout. Different collection days also need separate checkouts.",
      "After payment, the buyer gets a confirmation email. You get a sale alert with their details.",
      "Open Collections for the make list (what to produce), packing list (Ready → Collected), printable labels, and customer emails.",
    ],
  },
  {
    slug: "pre-order-pages",
    title: "Create a pre-order page",
    summary:
      "Build a multi-product sheet with one order window, optional deposit, cart add-on, and its own link or QR.",
    videoUrl: null,
    omitVideo: true,
    related: ["pre-orders", "upsells", "product-options", "collections-day"],
    ctas: [
      { label: "New pre-order page", href: "/dashboard/pre-order-pages/new" },
      { label: "Products", href: "/dashboard/products" },
    ],
    steps: [
      "Connect Stripe first (Settings → Stripe). Pre-order pages cannot go live without card payments enabled.",
      "On each product you want on the sheet, open the product editor and turn on Available for pre-order pages. Collection day and add-ons are set on the page, not on the product.",
      "Go to Pre-order pages → create a page. Name it (e.g. Friday bake 20 Mar). Optionally set the URL slug or leave it to auto-generate.",
      "Set Orders close and Collection (or delivery) time. Add a short note if buyers need directions or delivery timing.",
      "Choose Handover: Collect at a place, or Deliver to an address. Choose Pay in full, or Deposit (percent now, balance on handover).",
      "Optionally show exact slots left publicly. Tick Hide on business page if these products should stay off the main stall catalogue and business QR - buyers use this page’s link or QR only.",
      "Select the products on this page. Items with options open their own product page so buyers can pick size, flavour, and so on.",
      "Optional: add a Pre-order add-on (name, price, optional % or $ off). It appears in the cart for this sheet and inherits the same collection day and payment settings.",
      "Save, open the public link to test, then use Print QR on the page for a poster unique to that collection day. Share the link on Facebook, Instagram, WhatsApp, or email.",
    ],
  },
  {
    slug: "collections-day",
    title: "Collections: make list and packing",
    summary:
      "See what to produce, pack by customer, mark Ready and Collected, and print labels.",
    videoUrl: null,
    omitVideo: true,
    related: ["pre-orders", "pre-order-pages", "email-customers", "subscriptions"],
    ctas: [{ label: "Collections", href: "/dashboard/collections" }],
    steps: [
      "Open Collections after paid pre-orders start coming in. Days are grouped by collection or delivery date.",
      "Use the make list first: totals by product (and options), order count, and money taken so you know what to bake, pack, or pick.",
      "Scroll to Pack for that day. Each order shows the buyer, items, and status. Mark Ready when packed, then Collected (or delivered) when handed over.",
      "Print the day list from the Collections toolbar when you want a paper run sheet. Use printable order labels when you bag or box by customer.",
      "Tap a customer email to message one buyer, or Email all on that day to reach everyone picking up (or receiving) together - see Email customers.",
      "Collections shows upcoming paid pre-orders and the last 14 days. Older history stays under Orders.",
    ],
  },
  {
    slug: "email-customers",
    title: "Email customers from Orders and Collections",
    summary:
      "Message one buyer or everyone on a collection day - subject and body sent from Vendl.",
    videoUrl: null,
    omitVideo: true,
    related: ["collections-day", "pre-orders", "restock-emails"],
    ctas: [
      { label: "Collections", href: "/dashboard/collections" },
      { label: "Orders", href: "/dashboard/orders" },
    ],
    steps: [
      "Buyers leave an email on pre-orders (and when your checkout asks for it). That address is how you contact them - you do not need a separate mailing list tool.",
      "On Collections or Orders, tap the customer email. Enter a subject and message, then Send email. Keep it short: ready for pickup, running late, gate code, and so on.",
      "On Collections, use Email all (N) on a collection day to send the same subject and body to everyone with an email on that day’s paid orders.",
      "Emails go from Vendl on your behalf. Use them for fulfilment and pickup notes - not spam or marketing blasts unrelated to their order.",
      "Sale and low-stock alerts to you are separate - those live under Settings → Alerts. Restock emails to shoppers who opted in are covered in Notify customers of a restock.",
    ],
  },
  {
    slug: "stand-branding",
    title: "Logo, colours, and social links",
    summary:
      "Make your public stall and QR poster look like your farm - logo, brand colours, and social icons.",
    videoUrl: null,
    omitVideo: true,
    related: ["pre-orders", "first-stand", "upsells"],
    ctas: [{ label: "My Businesses", href: "/dashboard/businesses" }],
    steps: [
      "Branding is available on Free and Pro. Open My Businesses → your business → Branding.",
      "Upload a logo (JPEG, PNG, or WebP). It appears on the public stall header and on your QR poster.",
      "Pick a primary colour for buttons and a secondary colour for prices and stock labels. Use Vendl default to clear a custom colour.",
      "Add Instagram, Facebook, TikTok, YouTube, or website links. Leave a field blank to hide that icon.",
      "Save branding, then open your public stall link (or scan the QR) to check the logo, colours, and social icons.",
      "Print or refresh the QR sign after changing the logo so the poster matches.",
    ],
  },
];
