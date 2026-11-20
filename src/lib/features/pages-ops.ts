import type { FeaturePage } from "@/lib/features/types";

export const OPS_FEATURES: FeaturePage[] = [
  {
    slug: "payments",
    title: "Payments & fees",
    menuBlurb: "Stripe, Square, PayPal, PayID, cash and more.",
    eyebrow: "GET PAID YOUR WAY",
    plan: "FREE & PRO",
    metaTitle: "Payments & fees · Vendl",
    metaDescription:
      "Connect Stripe or Square (PayPal on Pro). Cards, wallets, PayID, cash and pay-later — money goes to your own account.",
    headline: "Get paid the way your customers pay.",
    support:
      "Connect the providers you already use. Card, Tap & Go, local bank methods and cash — available methods depend on your country.",
    visual: "payments",
    bullets: [
      "Connect Square, Stripe or PayPal (Pro)",
      "Cards, Apple Pay, Google Pay and Link",
      "PayID and PayTo in Australia with no Vendl fee",
      "Cash for in-person sales with no Vendl fee",
      "Sales tax: GST, VAT and US sales tax",
    ],
    steps: [
      { title: "Connect a provider", body: "Link Stripe or Square from your payments settings." },
      { title: "Turn on methods", body: "Enable the wallets and local options you want to offer." },
      { title: "Take the sale", body: "Money settles to your provider account; Vendl tracks the order." },
    ],
    table: {
      caption: "Vendl fee on card, Tap & Go and pay-later",
      headers: ["Plan", "Vendl fee", "Provider fees"],
      rows: [
        ["Free", "2.5%", "Apply separately"],
        ["Pro", "None", "Apply separately"],
      ],
    },
    freeVsPro: {
      free: ["Stripe or Square", "2.5% Vendl fee on card sales"],
      pro: ["PayPal checkout", "No Vendl fee on card sales"],
    },
    faqs: [
      {
        q: "Where does the money go?",
        a: "Straight to your Stripe, Square or PayPal account. Vendl does not hold your funds.",
      },
    ],
    relatedSlugs: ["stall-checkout", "orders", "online-shop"],
  },
  {
    slug: "inventory",
    title: "Inventory & stock",
    menuBlurb: "Counts, reports and days of cover.",
    eyebrow: "KNOW WHAT YOU HAVE",
    plan: "FREE & PRO",
    metaTitle: "Inventory & stock · Vendl",
    metaDescription:
      "Stock counts, inventory reports, days of cover and status labels — keep shelves and the shop in sync.",
    headline: "Know what you have. And what will run out.",
    support:
      "Track stock across the shop and stall. Count shelves, fix differences in one go, and see what needs making this week.",
    visual: "generic",
    bullets: [
      "Inventory report: status, sold in 7 and 30 days, last sold",
      "Days of cover — see what runs out this week",
      "Stock value at cost and retail",
      "Stock count: count the shelves, fix every difference in one tap",
      "Product status: In production, On order, Seasonal, Discontinued",
    ],
    steps: [
      { title: "Set starting stock", body: "Add counts when you create or import products." },
      { title: "Sell as usual", body: "Orders and stall sales reduce stock automatically." },
      { title: "Count and adjust", body: "Run a stock count when reality drifts from the system." },
    ],
    faqs: [
      {
        q: "Can I import stock?",
        a: "Spreadsheet import and export are available; Pro adds fuller data import from other platforms.",
      },
    ],
    relatedSlugs: ["orders", "costing", "suppliers", "restock-alerts"],
  },
  {
    slug: "orders",
    title: "Orders",
    menuBlurb: "Full order details across every channel.",
    eyebrow: "ONE ORDER LIST",
    plan: "FREE & PRO",
    metaTitle: "Orders · Vendl",
    metaDescription:
      "See stall, shop, pre-order and subscription orders in one place with full details, refunds and sale alerts.",
    headline: "Every sale in one place.",
    support:
      "Stall scans, online checkouts, pre-orders and subscriptions land in the same orders view with the detail you need to fulfil.",
    visual: "generic",
    bullets: [
      "Orders with full line items and customer details",
      "Sales by channel — stall, pre-orders, subscriptions",
      "Refunds from your orders page",
      "Sale alerts by email and push",
    ],
    steps: [
      { title: "Take the sale", body: "Any channel creates an order the moment payment succeeds." },
      { title: "Fulfil from the list", body: "Filter by day, channel or status." },
      { title: "Refund if needed", body: "Issue refunds without leaving the orders page." },
    ],
    faqs: [
      {
        q: "Do stall sales show up here?",
        a: "Yes. QR stall checkouts create the same order records as online sales.",
      },
    ],
    relatedSlugs: ["inventory", "payments", "customers", "stall-checkout"],
  },
  {
    slug: "suppliers",
    title: "Suppliers",
    menuBlurb: "Neighbour logins, stock approval and tallies.",
    eyebrow: "SELL ALONGSIDE OTHERS",
    plan: "FREE & PRO",
    metaTitle: "Suppliers · Vendl",
    metaDescription:
      "Invite suppliers with their own login. Approve stock, sell oldest first, and track what you owe.",
    headline: "Sell a neighbour’s goods alongside your own.",
    support:
      "Invite a supplier to their own login. They add stock; you approve it. Oldest stock sells first, with a running tally of what you owe.",
    visual: "generic",
    bullets: [
      "Invite a supplier to their own login",
      "They add stock to your products or list their own",
      "Approve stock before it goes on sale",
      "Oldest supplier stock sells first",
      "Running tally of what you owe, with Mark paid",
    ],
    steps: [
      { title: "Invite", body: "Send a supplier their own login." },
      { title: "Approve stock", body: "Review what they add before it appears for sale." },
      { title: "Settle up", body: "Track the balance and mark payments when you pay them." },
    ],
    faqs: [
      {
        q: "Do suppliers see my whole business?",
        a: "No. They get a supplier login scoped to the products and stock they work with.",
      },
    ],
    relatedSlugs: ["inventory", "orders", "online-shop"],
  },
  {
    slug: "calendar",
    title: "Calendar",
    menuBlurb: "Pick-ups, pre-orders and production in one view.",
    eyebrow: "SEE WHAT’S COMING UP",
    plan: "PRO",
    metaTitle: "Calendar · Vendl",
    metaDescription:
      "Bring pick-ups, pre-orders and production into one calendar, with two-way Google Calendar sync on Pro.",
    headline: "See what’s coming up.",
    support:
      "Pick-ups, pre-order closes and production days in one place — so the week is visible before it hits you.",
    visual: "calendar",
    bullets: [
      "Pick-ups, pre-orders and production on one calendar",
      "Two-way Google Calendar sync",
      "Plan the make day against what is already sold",
    ],
    steps: [
      { title: "Connect Google (optional)", body: "Sync both ways so phone and Vendl stay aligned." },
      { title: "Watch the week", body: "See collections and closes before you schedule the bake." },
      { title: "Adjust", body: "Move production around what customers already ordered." },
    ],
    faqs: [
      {
        q: "Is the calendar on Free?",
        a: "Calendar is a Pro feature. Free still shows order lists and collection details without the full calendar view.",
      },
    ],
    relatedSlugs: ["pre-orders", "subscriptions", "orders", "costing"],
  },
];
