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
      "Back on the Payments page, under Product checkout provider, choose Square. Keep Stripe connected if you sell subscriptions, memberships or pre-orders.",
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
];
