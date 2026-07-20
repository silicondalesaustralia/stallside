import type { KnowledgeArticle } from "./types";

export const ordersAlertsBillingArticles: KnowledgeArticle[] = [
  {
    slug: "sign-in-phone",
    title: "Sign in and open Stallside on your phone",
    summary:
      "Use a 6-digit email code and Add to Home Screen so login and phone alerts stay in one place.",
    videoUrl: null,
    omitVideo: true,
    imageSrc: "/guides/home-screen-stallside.jpg",
    imageAlt:
      "iPhone Home Screen with the Stallside app icon highlighted — open Stallside from this icon, not from Safari",
    imageWidth: 470,
    imageHeight: 1024,
    related: ["alerts-push", "first-stand"],
    ctas: [
      { label: "Sign in", href: "/login" },
      { label: "Alert settings", href: "/dashboard/settings" },
    ],
    steps: [
      "On your phone browser, go to stallside.app and tap Sign in (or Start free trial if you are new).",
      "Enter your email and tap Email me a code. Check your inbox for a 6-digit code.",
      "Type the code into Stallside on the same screen. Do not leave this browser window to complete sign-in.",
      "On iPhone: tap Share → Add to Home Screen → Add. Open Stallside from that new icon next time (not from a Safari tab).",
      "On Android: use Chrome menu → Add to Home screen, then open from the icon.",
      "Once signed in you land on the dashboard. From Settings you can enable phone push alerts while you are in the Home Screen app.",
      "If the Home Screen icon shows Check your email or asks for a code again, request a new code and enter it inside that Home Screen window.",
    ],
  },
  {
    slug: "alerts-push",
    title: "Email and phone push alerts",
    summary:
      "Get sale, low-stock, and sold-out alerts by email and on your phone.",
    videoUrl: null,
    omitVideo: true,
    imageSrc: "/guides/alerts-settings.jpg",
    imageAlt:
      "Settings → Alerts: email alerts, phone push alerts, Enable this phone, and alert emails",
    imageWidth: 1024,
    imageHeight: 759,
    related: ["sign-in-phone", "first-stand"],
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
    related: ["billing", "first-stand"],
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
