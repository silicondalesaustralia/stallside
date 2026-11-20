import type { FeaturePage } from "@/lib/features/types";

export const SELL_FEATURES: FeaturePage[] = [
  {
    slug: "online-shop",
    title: "Online shop",
    menuBlurb: "A shop link with your logo, colours and products.",
    eyebrow: "YOUR STOREFRONT",
    plan: "FREE & PRO",
    metaTitle: "Online shop · Vendl",
    metaDescription:
      "Share a shop link with your logo, colours and products. Categories, variants, bundles and search-friendly product pages — included on Free.",
    headline: "A proper home for what you make.",
    support:
      "Every business gets a shop link. Customers browse products, pre-orders and memberships without you building a site from scratch.",
    visual: "generic",
    bullets: [
      "Your own shop link with logo, colours and socials",
      "Categories with their own pages and a Shop menu",
      "Product pages with options, bundle prices and freshness notes",
      "Choose product order and how the shop page lays out",
      "Search-friendly titles, descriptions and share images",
    ],
    steps: [
      { title: "Add products", body: "Name, photos, price, stock and variants in one place." },
      { title: "Shape the shop", body: "Set categories, colours and what appears on the front." },
      { title: "Share the link", body: "Post it, print it on a poster, or open it from a QR code." },
    ],
    freeVsPro: {
      free: ["Shop link", "Products, categories and variants", "Pick-ups and delivery options"],
      pro: ["Full website builder", "Custom domain", "Reviews, tags and pixels"],
    },
    faqs: [
      {
        q: "Do I need a website to sell?",
        a: "No. Free includes a shop link you can share. Pro adds the website builder and custom domain when you want a full site.",
      },
      {
        q: "Can customers buy from the shop?",
        a: "Yes. Connect Stripe or Square (PayPal on Pro) and customers pay on their phone or computer.",
      },
    ],
    relatedSlugs: ["website", "pre-orders", "payments", "stall-checkout"],
  },
  {
    slug: "pre-orders",
    title: "Pre-orders",
    menuBlurb: "Order windows, deposits and collection days.",
    eyebrow: "SELL AHEAD",
    plan: "FREE & PRO",
    metaTitle: "Pre-orders · Vendl",
    metaDescription:
      "Take pre-orders with order windows, deposits and collection days. Bake or make to demand instead of guessing stock.",
    headline: "Sell before you make.",
    support:
      "Open a pre-order window, take deposits if you want, and plan collections. Customers order ahead; you produce what is sold.",
    visual: "calendar",
    bullets: [
      "Pre-order pages with clear open and close times",
      "Deposits or full payment at checkout",
      "Collection days customers can choose from",
      "Orders land in one list ready for the bake or make day",
      "Works alongside your everyday shop and stall",
    ],
    steps: [
      { title: "Set the window", body: "Choose when orders open and when they close." },
      { title: "List what is available", body: "Add products, limits and any deposit rules." },
      { title: "Collect and fulfil", body: "Customers pick a day; you fulfil from the order list." },
    ],
    table: {
      caption: "Pre-orders vs walk-up sales",
      headers: ["", "Pre-orders", "Walk-up / stall"],
      rows: [
        ["When paid", "Ahead of the make", "At the stand or shop"],
        ["Stock risk", "Make what is ordered", "Guess demand"],
        ["Best for", "Weekly bakes, seasonal drops", "Farm gate, markets"],
      ],
    },
    faqs: [
      {
        q: "Are pre-orders on Free?",
        a: "Yes. Pre-order pages with order windows and deposits are included on Free.",
      },
    ],
    relatedSlugs: ["subscriptions", "orders", "calendar", "online-shop"],
  },
  {
    slug: "subscriptions",
    title: "Subscriptions & memberships",
    menuBlurb: "Weekly boxes and member caps for regulars.",
    eyebrow: "REPEAT CUSTOMERS",
    plan: "FREE & PRO",
    metaTitle: "Subscriptions & memberships · Vendl",
    metaDescription:
      "Offer weekly, fortnightly or monthly boxes and memberships. Customers skip, pause or cancel themselves.",
    headline: "Make it a regular thing.",
    support:
      "Turn one-off buyers into regulars with subscription boxes and memberships. Collections are created for you; customers manage their own pauses.",
    visual: "generic",
    bullets: [
      "Weekly, fortnightly or monthly boxes on card",
      "Memberships for a set number of weeks with a member cap",
      "Weekly, monthly or pay-in-full plans with benefits",
      "Weekly collections created automatically",
      "Shoppers skip, pause or cancel themselves",
    ],
    steps: [
      { title: "Create the offer", body: "Pick the rhythm, price and what is included." },
      { title: "Share the link", body: "Customers subscribe from your shop or a dedicated page." },
      { title: "Fulfil on schedule", body: "Collections appear on your calendar and order lists." },
    ],
    faqs: [
      {
        q: "Can customers pause?",
        a: "Yes. Skip, pause and cancel are available to the shopper so you are not chasing emails.",
      },
    ],
    relatedSlugs: ["pre-orders", "customers", "payments", "calendar"],
  },
  {
    slug: "stall-checkout",
    title: "Stall & QR checkout",
    menuBlurb: "QR self-checkout for stands, markets and honesty boxes.",
    eyebrow: "FARM STANDS & MARKETS",
    plan: "FREE & PRO",
    metaTitle: "Stall & QR checkout · Vendl",
    metaDescription:
      "Put a QR code on your stand or market table. Customers browse and pay on their phone — no card reader required.",
    headline: "Sell at the gate. Get paid on their phone.",
    support:
      "One QR code for your honesty box, market table or roadside stand. Customers scan, choose and pay. Stock updates as you sell.",
    visual: "stall",
    bullets: [
      "One QR code for stalls, honesty boxes and counters",
      "Customers pay on their own phone — no card reader needed",
      "Printable poster with your business name and pay methods",
      "Sale alerts the moment someone pays",
      "Stock counts update at the stand and online",
    ],
    steps: [
      { title: "Connect payments", body: "Link Stripe or Square (PayPal on Pro)." },
      { title: "Print your poster", body: "Download a ready-made A4, half or quarter sheet." },
      { title: "Put it out", body: "Customers scan, shop and pay while you keep working." },
    ],
    freeVsPro: {
      free: ["Main QR code and printable poster", "2.5% Vendl fee on card sales"],
      pro: ["More QR codes", "No Vendl fee on card sales"],
    },
    faqs: [
      {
        q: "Do I need a card reader?",
        a: "No. Customers pay on their phone after scanning your QR code.",
      },
      {
        q: "Is there a longer stall guide?",
        a: "Yes — see the dedicated Stall pages at /stall for niche examples.",
      },
    ],
    relatedSlugs: ["payments", "inventory", "online-shop", "orders"],
  },
  {
    slug: "bundles",
    title: "Bundles & volume pricing",
    menuBlurb: "Sell more with packs, deals and volume breaks.",
    eyebrow: "PRICE SMARTER",
    plan: "FREE & PRO",
    metaTitle: "Bundles & volume pricing · Vendl",
    metaDescription:
      "Offer volume breaks and product bundles so customers buy more in one go — included on Free.",
    headline: "Price packs the way you sell them.",
    support:
      "Set volume pricing and bundles alongside single-item prices. Shoppers see the better deal without you rewriting the menu every week.",
    visual: "generic",
    bullets: [
      "Volume pricing for multi-buys",
      "Bundle products into ready-made packs",
      "Works on the shop, pre-orders and stall",
      "Clear prices on product pages",
    ],
    steps: [
      { title: "Set the deal", body: "Add volume breaks or build a bundle from products you already sell." },
      { title: "Show it on the page", body: "Customers see single and pack prices together." },
      { title: "Track the sale", body: "Orders and stock update for every item in the pack." },
    ],
    faqs: [
      {
        q: "Is this Free or Pro?",
        a: "Volume and bundle pricing are included on Free.",
      },
    ],
    relatedSlugs: ["online-shop", "pre-orders", "inventory"],
  },
];
