import type { KnowledgeArticle } from "./types";

export const squareArticles: KnowledgeArticle[] = [
  {
    slug: "connect-square",
    title: "Connect Square and take Square payments",
    summary:
      "Link your Square account, pick a location, and use Square for product checkout.",
    availability: "Australia & US",
    keywords: ["square", "connect", "location", "reader", "pos"],
    related: ["square-sync", "checkout-provider", "square-subscriptions", "payments-overview"],
    ctas: [
      { label: "Square settings", href: "/dashboard/settings/square" },
      { label: "Payments", href: "/dashboard/payments" },
    ],
    steps: [
      "Square is available when your billing region is Australia (AUD) or the United States (USD). Open Payments and tap the Square link.",
      "Tap Connect Square, sign in to Square (or create an account) and approve Vendl. You come back to a page showing Status: Connected and your merchant name.",
      "Under Primary sync location, pick the Square location to use and tap Save location. Use Map to Vendl business to link each location to a Vendl business.",
      "Tick what you want Square for: Online Vendl payments, POS inventory sync and Product / catalogue sync. Tap Save.",
      "On Payments, under Product checkout provider, choose Square and tap Save provider.",
      "Open Payments and, under Checkout payments, tick Square and tap Save payment options.",
      "Scan your QR on another phone and run a small test sale. The payment lands in your Square account and you get your usual sale alert.",
    ],
    tips: [
      "Your Square account must be based in the same country as your Vendl billing region.",
      "The Square checkbox on a business stays greyed out until Square is connected, payments are on and a primary location is set.",
      "To disconnect, tap Disconnect Square. Vendl keeps the last synced stock levels and your product links for history.",
    ],
  },
  {
    slug: "square-sync",
    title: "Sync products and stock with Square",
    summary:
      "Link Square items to Vendl products, import from Square or push to Square, and keep stock matching both ways.",
    availability: "Australia & US",
    keywords: ["square", "sync", "import", "inventory", "catalogue", "match"],
    related: ["connect-square", "inventory-report", "stock-count"],
    ctas: [{ label: "Square settings", href: "/dashboard/settings/square" }],
    steps: [
      "On the Square settings page, turn on Product / catalogue sync, and POS inventory sync for stock.",
      "Under Products, tap Review matches to link existing Square items to the same Vendl products. Vendl suggests matches by SKU, barcode or name, but you confirm each one.",
      "To bring items in, tap Load Square items, choose Import into (a business) and pick the items. Vendl creates them with price, SKU, stock and photo, already linked.",
      "To push the other way, pick Vendl products that aren't in Square yet. Vendl creates them in Square, links them and sets their starting stock at your location.",
      "From then on, online sales, cash and PayID sales, manual stock changes, stock counts and production batches in Vendl update the count in Square.",
      "When a count changes in Square (for example a sale on your Square reader at the market), Vendl updates the linked product's stock.",
      "Sync health at the bottom of the Square page shows whether payments, inventory and catalogue sync are on, and when stock last synced.",
    ],
    tips: [
      "Only products priced in your Square account's currency (AUD in Australia, USD in the US) can be pushed to Square.",
      "Name and price changes aren't synced after linking. Update them in both places.",
      "Cancelling or deleting a Vendl order doesn't put the stock back in Square. Adjust the count in Square if needed.",
    ],
  },
  {
    slug: "square-subscriptions",
    title: "Subscriptions and memberships on Square",
    summary:
      "Bill recurring boxes, memberships and pre-order balances through Square instead of Stripe.",
    availability: "Australia & US",
    keywords: ["square", "subscription", "membership", "recurring", "deposit", "saved card"],
    related: ["connect-square", "subscriptions", "memberships", "pre-order-pages"],
    ctas: [
      { label: "Square settings", href: "/dashboard/settings/square" },
      { label: "Subscriptions", href: "/dashboard/subscriptions" },
    ],
    steps: [
      "Connect Square, turn on Online Vendl payments, set a primary location, and choose Square as your Product checkout provider on Payments. Tick Square on the business that sells the offer.",
      "On the Square settings page, under Subscriptions & memberships, turn on Take subscription and membership payments with Square.",
      "If you connected Square before this feature, you'll be asked to reconnect once so Vendl can save shoppers' cards. Your settings and product links stay as they are.",
      "Create or open a subscription or membership as usual. The offer's currency must match your Square account (AUD or USD).",
      "Shoppers pay by card on your sign-up page. Each period Vendl charges the saved card. Box subscriptions create an order under Pick Ups & Delivery each time.",
      "If a payment fails, the shopper is emailed a link to update their card. Vendl retries after 1, 3 and 5 days, then cancels and lets you know.",
    ],
    tips: [
      "Shoppers can update their card, skip the next cycle, pause, resume or cancel from their manage link. Cancelling stops at the end of the period they've paid for.",
      "The price is locked in when a shopper signs up. Changing an offer's price applies to new sign-ups only.",
      "Existing Stripe subscribers stay on Stripe.",
      "Pre-order deposits work the same way: the deposit is charged at checkout and the balance is charged to the same card before handover.",
    ],
  },
];
