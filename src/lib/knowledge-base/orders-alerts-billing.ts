import type { KnowledgeArticle } from "./types";

export const ordersAlertsBillingArticles: KnowledgeArticle[] = [
  {
    slug: "sign-in-phone",
    title: "Sign in and open Vendl on your phone",
    summary:
      "Use a 6-digit email code and Add to Home Screen so login and phone alerts stay in one place.",
    videoUrl: null,
    omitVideo: true,
    imageSrc: "/guides/home-screen-vendl.jpg",
    imageAlt:
      "iPhone Home Screen with the Vendl app icon highlighted - open Vendl from this icon, not from Safari",
    imageWidth: 470,
    imageHeight: 1024,
    related: ["alerts-push", "first-stand"],
    ctas: [
      { label: "Sign in", href: "/login" },
      { label: "Alert settings", href: "/dashboard/settings" },
    ],
    steps: [
      "On your phone browser, go to vendl.app and tap Sign in (or Start free if you are new).",
      "Enter your email and tap Email me a code. Check your inbox for a 6-digit code.",
      "Type the code into Vendl on the same screen. Do not leave this browser window to complete sign-in.",
      "On iPhone: tap Share → Add to Home Screen → Add. Open Vendl from that new icon next time (not from a Safari tab).",
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
    related: ["sign-in-phone", "first-stand", "restock-emails"],
    ctas: [{ label: "Alert settings", href: "/dashboard/settings" }],
    steps: [
      "Open Settings → Alerts. Turn Email alerts on to get sale, low stock, sold out, and related emails.",
      "Add extra alert emails (partner, farmhand) under Alert emails - your contact email is always included.",
      "Turn Phone push alerts on, then tap Enable this phone and Allow when the browser asks.",
      "On iPhone, open Vendl from the Home Screen icon before enabling push. Safari tabs alone cannot keep reliable web push.",
      "When a customer completes a sale, you get a Sale alert. When stock hits your threshold or zero, you get Low stock or Sold out (about 6 hours cooldown per product).",
      "To stop phone alerts on this device, turn Phone push off and save (or revoke notification permission in phone Settings).",
      "A future native App Store / TestFlight app can use a custom sound; Home Screen web push uses the system notification sound.",
    ],
  },
  {
    slug: "billing",
    title: "Free and Vendl Pro",
    summary:
      "Free forever with all features, optional Pro to waive the Vendl card fee - the dashboard never locks.",
    videoUrl: null,
    related: ["customer-payments", "first-stand"],
    ctas: [{ label: "Billing", href: "/dashboard/settings/billing" }],
    steps: [
      "Vendl’s subscription is optional Pro. It is separate from customer card payments at the stand.",
      "Free is $0/mo with all features. Vendl fee is 2.5% + 30c on Stripe card, Tap & Go, and pay-later (2.5% on Square); cash and PayID stay free. Accounts created before 2 Oct 2026 keep 2.5% until they upgrade to Pro or first connect Square. Australian sellers absorb the fee (card surcharges aren't allowed); elsewhere you can pass it on in Settings → Card / Tap & Go. Standard Stripe processing fees apply separately.",
      "New owners start on Free from day one. Upgrade anytime from Settings → Billing to remove the Vendl card fee.",
      "Vendl Pro is billed monthly via Stripe. Manage payment method or cancel in the Stripe Customer Portal.",
      "If you cancel Pro, you keep Pro until the paid period ends, then return to Free (card fee applies again). Data is retained.",
      "Delete account (Settings) immediately cancels any subscription, stops emails, and permanently removes your data.",
    ],
  },
  {
    slug: "customer-payments",
    title: "Accept card at the stand",
    summary:
      "Connect Stripe for card / Tap & Go - separate from your Vendl subscription. In Australia you can also use Square.",
    videoUrl: "https://youtu.be/keo53YG_Nks",
    comingSoon: false,
    related: ["payments-overview", "connect-square", "billing", "pre-orders", "subscriptions"],
    ctas: [
      { label: "Connect Stripe", href: "/dashboard/settings/stripe" },
      { label: "Payments", href: "/dashboard/payments" },
    ],
    steps: [
      "Stripe Connect is how customers pay you at the stand by card, Apple Pay, or Google Pay. Available on Free and Pro.",
      "On Free, Vendl takes 2.5% + 30c on Stripe card, Tap & Go, and pay-later (outside Australia you can absorb or pass it on in Settings → Stripe; card surcharges aren't allowed in Australia, so Australian sellers absorb it). Pro has no Vendl card fee on the first A$4,000 of Stripe sales each month, then 0.5%. Standard Stripe processing fees apply on both plans.",
      "Open Settings → Stripe (Card / Tap & Go) and tap Connect Stripe. Complete Stripe’s onboarding with your business and bank details.",
      "When charges are enabled, turn Card / Tap & Go on for each business under My Businesses → manage.",
      "Scan your Vendl QR on another phone and run a small test card sale. Payments go to your Stripe account.",
      "Prefer Square for product checkout? See Connect Square and take Square payments. Pre-orders, deposits, subscriptions and memberships can all run on Square.",
      "Cash and PayID (Australia only) work without Stripe and have no Vendl fee.",
    ],
  },
];
