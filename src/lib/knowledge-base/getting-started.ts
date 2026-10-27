import type { KnowledgeArticle } from "./types";

export const gettingStartedArticles: KnowledgeArticle[] = [
  {
    slug: "first-stand",
    title: "Your first sale in 10 minutes",
    summary:
      "Create a business, add a product, print a QR sign, and run a test cash checkout.",
    videoComingSoon: true,
    keywords: ["setup", "start", "new business", "stand", "first", "qr", "onboarding"],
    related: ["business-details", "qr-signs", "add-product", "cash-payid", "customer-payments"],
    ctas: [
      { label: "New business", href: "/dashboard/businesses/new" },
      { label: "Add product", href: "/dashboard/products/new" },
    ],
    steps: [
      "Tap Create a business in the sidebar (or New business on Overview). Enter a Business name, Suburb / location, Currency and Timezone, then tap Create Business.",
      "You land on your new business with an Add what you sell card. Tap Add product.",
      "Pick the Stand, then enter a Product name, Price, Starting stock and Low-stock threshold, and tap Save product.",
      "Tap QR & print at the top of the business page. Under Cart mode keep Product cart, tap Save sign details, then print or tap Download PNG.",
      "Put the QR at your stall. On another phone, scan it to open your checkout page.",
      "Add the test product, choose Pay cash and tap I have paid cash.",
      "Back in Vendl, check Orders. The sale is there and the product's stock has dropped by one.",
    ],
    tips: [
      "Sale, low-stock and sold-out emails are on from the start. To get alerts on your phone too, see Phone and email alerts.",
      "Shoppers see Available / Low stock / Sold out rather than exact counts. Change this with Show exact stock publicly under Business Details.",
      "Want card payments? Connect Stripe or Square next (see How payments work in Vendl).",
    ],
  },
  {
    slug: "dashboard-overview",
    title: "Read your Overview dashboard",
    summary:
      "Sales, orders, payment split, low stock, and your next setup step for the selected business.",
    keywords: ["home", "overview", "stats", "sales", "chart", "next move"],
    related: ["first-stand", "manage-orders", "inventory-report"],
    ctas: [{ label: "Overview", href: "/dashboard" }],
    steps: [
      "Open Overview (Home on your phone). Everything on it is for the business picked in the Business switcher at the bottom of the sidebar.",
      "Pick a range: Today, Yesterday, 7, 14 or 30 days, 6 or 12 months, or Custom.",
      "The tiles show Sales, Orders and Payment Method (cash vs checkout). The chart compares the range with the one before it, and you can filter it by channel.",
      "Your next move suggests the next setup step, such as adding a product, printing your QR or connecting Stripe, until you're live.",
      "Low stock lists products at or under their threshold. Tap Details to open Products.",
      "Pre-orders and Subscriptions show what's coming up, with shortcuts to create a new page or offer. Recent sales lists your latest orders; tap View all for Orders.",
    ],
  },
  {
    slug: "sign-in-phone",
    title: "Sign in and add Vendl to your phone",
    summary:
      "Sign in with a 6-digit email code and add Vendl to your Home Screen so phone alerts work.",
    keywords: ["login", "sign in", "code", "home screen", "iphone", "android", "app"],
    related: ["alerts-push", "first-stand"],
    ctas: [{ label: "Notifications", href: "/dashboard/notifications" }],
    steps: [
      "On your phone, go to vendl.app and tap Owner login (or Get Free Account if you're new).",
      "Enter your email and tap Email me a code.",
      "Type the 6-digit code from your inbox into Enter your code and tap Sign in. Codes expire after 10 minutes; tap Resend code if needed.",
      "On iPhone: tap Share → Add to Home Screen → Add. Open Vendl from that icon from now on, not from a Safari tab.",
      "On Android: open the Chrome menu → Add to Home screen, then open Vendl from the icon.",
      "Open Vendl from the icon and tap Enable phone alerts when the banner appears, then Allow.",
    ],
    tips: [
      "If the Home Screen app asks you to sign in, request a new code and enter it inside the Home Screen app.",
      "Wrong email? Tap Use a different email on the code screen.",
    ],
  },
];
