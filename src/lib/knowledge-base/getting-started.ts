import type { KnowledgeArticle } from "./types";

export const gettingStartedArticles: KnowledgeArticle[] = [
  {
    slug: "first-stand",
    title: "Your first stand in 10 minutes",
    summary:
      "Create a stand, add a product, print a QR, and run a test cash checkout.",
    videoUrl: "https://www.youtube.com/watch?v=qJeoTruQKMQ",
    related: ["sign-in-phone", "alerts-push", "customer-payments", "pre-orders", "stand-branding"],
    ctas: [
      { label: "New Business", href: "/dashboard/businesses/new" },
      { label: "Add product", href: "/dashboard/products/new" },
    ],
    steps: [
      "Open My Businesses → New Business. Name it, pick a currency, and add short customer instructions if you want (e.g. where to leave cash).",
      "Set whether customers see exact stock counts or only Available / Low stock / Sold out, then save.",
      "Go to Products → Add product. Choose the business, name, price, starting stock, and a low-stock threshold, then save.",
      "Open the business → QR & print (or the QR link from My Businesses). Pick a print size and print or download the sign.",
      "Put the QR at the stall. On another phone, scan it to open the public checkout page.",
      "Add the test product, choose Pay cash, confirm the amount, and tap that you have paid.",
      "Back in the owner app, check Orders and Inventory - the sale should appear and stock should drop by one.",
      "Turn on email and/or phone push in Settings so the next real sale alerts you automatically.",
    ],
  },
];
