import type { KnowledgeArticle } from "./types";

export const gettingStartedArticles: KnowledgeArticle[] = [
  {
    slug: "sign-in-phone",
    title: "Sign in and open Stallside on your phone",
    summary:
      "Use a 6-digit email code and Add to Home Screen so login and phone alerts stay in one place.",
    videoUrl: null,
    related: ["first-stand", "alerts-push"],
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
    slug: "first-stand",
    title: "Your first stand in 10 minutes",
    summary:
      "Create a stand, add a product, print a QR, and run a test cash checkout.",
    videoUrl: null,
    related: ["manage-stands", "manage-products", "print-qr"],
    ctas: [
      { label: "New stand", href: "/dashboard/stands/new" },
      { label: "Add product", href: "/dashboard/products/new" },
    ],
    steps: [
      "Open My stands → New stand. Name the stand, pick a currency, and add short customer instructions if you want (e.g. where to leave cash).",
      "Set whether customers see exact stock counts or only Available / Low stock / Sold out, then save.",
      "Go to Products → Add product. Choose the stand, name, price, starting stock, and a low-stock threshold, then save.",
      "Open the stand → QR & print (or the QR link from My stands). Pick a print size and print or download the sign.",
      "Put the QR at the stall. On another phone, scan it to open the public checkout page.",
      "Add the test product, choose Pay cash, confirm the amount, and tap that you have paid.",
      "Back in the owner app, check Orders and Inventory — the sale should appear and stock should drop by one.",
      "Turn on email and/or phone push in Settings so the next real sale alerts you automatically.",
    ],
  },
];
