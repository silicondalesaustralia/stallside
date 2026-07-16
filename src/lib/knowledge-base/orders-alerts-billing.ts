import type { KnowledgeArticle } from "./types";

export const ordersAlertsBillingArticles: KnowledgeArticle[] = [
  {
    slug: "sales-orders",
    title: "Read sales and orders",
    summary:
      "Use Home overview and Orders to see cash and card sales, filters, and status.",
    videoUrl: null,
    related: ["adjust-inventory", "alerts-push", "billing"],
    ctas: [
      { label: "Overview", href: "/dashboard" },
      { label: "Orders", href: "/dashboard/orders" },
    ],
    steps: [
      "Home (Overview) shows sales totals for the date range you pick — handy for a quick day or week check.",
      "Open Orders for the full list and chart. Change the date range to zoom in or out.",
      "Each order shows method (cash, card, PayPal when enabled), total, stand, and status.",
      "Cash orders are customer-confirmed at the stall (honesty-box style). Card and PayPal orders are paid online when those payments are connected.",
      "Use this screen after a busy weekend to reconcile what left the stand with what was logged.",
      "Low stock callouts on Home point you to Inventory when something needs restocking.",
    ],
  },
  {
    slug: "alerts-push",
    title: "Email and phone push alerts",
    summary:
      "Get sale, low-stock, and sold-out alerts by email and on your phone.",
    videoUrl: null,
    related: ["sign-in-phone", "adjust-inventory", "sales-orders"],
    ctas: [{ label: "Alert settings", href: "/dashboard/settings" }],
    steps: [
      "Open Settings → Alerts. Turn Email alerts on to get sale, low stock, sold out, and related emails.",
      "Add extra alert emails (partner, farmhand) under Alert emails — your contact email is always included.",
      "Turn Phone push alerts on, then tap Enable this phone and Allow when the browser asks.",
      "On iPhone, open Stallside from the Home Screen icon before enabling push. Safari tabs alone cannot keep reliable web push.",
      "When a customer completes a sale, you get a Sale alert. When stock hits your threshold or zero, you get Low stock or Sold out (about 6 hours cooldown per product).",
      "To stop phone alerts on this device, turn Phone push off and save (or revoke notification permission in phone Settings).",
      "A future native App Store / TestFlight app can use a custom sound; Home Screen web push uses the system notification sound.",
    ],
  },
  {
    slug: "billing",
    title: "Stallside subscription and locked dashboard",
    summary:
      "Trial, subscribe, cancel, and what happens when the cash plan lapses.",
    videoUrl: null,
    related: ["customer-payments", "first-stand"],
    ctas: [{ label: "Billing", href: "/dashboard/settings/billing" }],
    steps: [
      "Stallside’s cash plan is what you pay for the app (stands, products, orders, QR). It is separate from customer card payments at the stand.",
      "New owners get a free trial. Home may show days left — subscribe before it ends to keep full access.",
      "Open Settings → Manage subscription (or Billing) to pick currency and subscribe with Stripe.",
      "To update a card or cancel, use Manage payment method / cancel (Stripe Customer Portal).",
      "If you cancel, you usually keep access until the paid period ends. Your stands and history stay saved.",
      "When access ends, stands, products, inventory, and orders lock. You can still open Billing and Guides to resubscribe — data is not deleted.",
      "Resubscribe anytime from Billing to reopen the dashboard.",
    ],
  },
  {
    slug: "customer-payments",
    title: "Accept card and PayPal at the stand",
    summary:
      "Connect Stripe or PayPal so customers pay you at the stand — separate from your Stallside subscription.",
    videoUrl: null,
    comingSoon: false,
    related: ["billing", "print-qr"],
    ctas: [
      { label: "PayPal", href: "/dashboard/settings/paypal" },
      { label: "Stripe", href: "/dashboard/settings/stripe" },
      { label: "Billing", href: "/dashboard/settings/billing" },
    ],
    steps: [
      "Your Stallside subscription pays for the software. Stripe / PayPal Connect is how customers pay you at the stand.",
      "For PayPal: open Settings → PayPal Connect. Use a PayPal Business account (not Friends & Family).",
      "Finish onboarding, turn “Show PayPal at checkout” on, then scan your Stallside QR and test a PayPal sale on your phone.",
      "Funds go to your PayPal account — Stallside is not in the funds flow. PayPal’s merchant fee comes out of your proceeds.",
      "Stripe Connect for Tap & Go follows the same idea from Settings → Stripe.",
    ],
  },
];
