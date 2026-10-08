import type { KnowledgeArticle } from "./types";

export const squareArticles: KnowledgeArticle[] = [
  {
    slug: "connect-square",
    title: "Connect Square and take Square payments",
    summary:
      "Link your existing Square account (or create one), pick a location, and use Square for product checkout. Australia only for now.",
    videoUrl: null,
    omitVideo: true,
    related: ["payments-overview", "square-sync", "customer-payments"],
    ctas: [
      { label: "Square settings", href: "/dashboard/settings/square" },
      { label: "Payments", href: "/dashboard/payments" },
    ],
    steps: [
      "Square is available to Australian accounts selling in AUD. Open Payments in the sidebar, tap Square, then Connect Square.",
      "Sign in to Square (or create an account) and approve Vendl. You come back to Vendl's Square page showing Connected and your business name.",
      "If your account was created before 2 Oct 2026, you'll be asked to confirm the move to current pricing before connecting.",
      "Under Location, pick the Square location to use and link it to your Vendl business. Stock syncs against this location.",
      "Under Use Square for, turn on what you want: Payments, Inventory sync, and Product / catalogue sync. Each shows a confirmation when saved.",
      "Back on the Payments page, under Product checkout provider, choose Square. Pre-order pages and deposits then take payment through Square too. Subscriptions and memberships can run on Square too (see Subscriptions and memberships on Square).",
      "On the same Payments page (Checkout payments for each business), tick Square and save.",
      "Scan your QR on another phone and run a small test sale. The payment lands in your Square account and you get the usual sale alert.",
      "To disconnect, use Disconnect on the Square page. Vendl keeps the last synced stock levels and your product links for history.",
    ],
  },
  {
    slug: "square-sync",
    title: "Sync products and stock with Square",
    summary:
      "Link Square items to Vendl products, import from Square or push to Square, and keep stock counts matching both ways.",
    videoUrl: null,
    omitVideo: true,
    related: ["connect-square", "payments-overview", "customer-payments"],
    ctas: [{ label: "Square settings", href: "/dashboard/settings/square" }],
    steps: [
      "Turn on Product / catalogue sync (and Inventory sync for stock) on the Square settings page first.",
      "Products: match existing Square items to the same Vendl products. Vendl never links items automatically from similar names, so you confirm each match.",
      "Import products from Square: pick Square items that aren't in Vendl yet. Vendl creates them in your chosen business with price, SKU, current stock and photo, already linked.",
      "Add Vendl products to Square: pick Vendl products that aren't in Square yet. Vendl creates them in Square, links them, and sets their starting stock at your Square location. Only AUD products can be added.",
      "Stock from Vendl to Square: online sales, cash and PayID sales, manual stock changes and stock counts in Vendl reduce or set the count in Square.",
      "Stock from Square to Vendl: when a count changes in Square (for example a sale on your Square reader at the market), Vendl updates the linked product's stock.",
      "Name and price changes aren't synced after linking. Update them in both places.",
      "Cancelling or deleting a Vendl order doesn't put the stock back in Square. Adjust the count in Square if needed.",
      "Sync health at the bottom of the Square page shows whether payments, inventory and catalogue sync are on, and when stock last synced.",
    ],
  },
  {
    slug: "square-subscriptions",
    title: "Subscriptions and memberships on Square",
    summary:
      "Bill recurring boxes and memberships through Square instead of Stripe. Shoppers' cards are saved with Square and charged automatically.",
    videoUrl: null,
    omitVideo: true,
    related: ["connect-square", "subscriptions", "payments-overview"],
    ctas: [
      { label: "Square settings", href: "/dashboard/settings/square" },
      { label: "New subscription", href: "/dashboard/subscriptions/new" },
    ],
    steps: [
      "Connect Square, turn on Payments, and choose Square as your product checkout provider on the Payments page. Tick Square for the business that sells the subscription.",
      "On the Square settings page, under Subscriptions & memberships, turn on Take subscription and membership payments with Square.",
      "If you connected Square before this feature, you'll be asked to reconnect once so Vendl can save shoppers' cards. Your settings and product links stay as they are.",
      "Create or open a subscription or membership as usual. No Stripe connection is needed; shoppers pay by card on your sign-up page and the money lands in your Square account.",
      "Each period Vendl charges the saved card. Box subscriptions create a Collections order each time; memberships keep their weekly collections.",
      "If a payment fails, the shopper is emailed a link to update their card. Vendl retries after 1, 3 and 5 days, then cancels and lets you know.",
      "Shoppers can update their card, skip the next cycle (no charge, no order), pause, resume or cancel from their manage link. Cancelling stops at the end of the period they've paid for.",
      "The price is locked in when a shopper signs up. Changing an offer's price applies to new sign-ups only.",
      "Existing Stripe subscribers stay on Stripe.",
      "Pre-order deposits work the same way: the deposit is charged at checkout, the card is saved with Square, and the balance is charged on collection or delivery day. If that charge fails, the shopper is emailed a link to pay with another card.",
    ],
  },
];
