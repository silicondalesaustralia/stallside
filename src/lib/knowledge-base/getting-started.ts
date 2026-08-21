import type { KnowledgeArticle } from "./types";

export const gettingStartedArticles: KnowledgeArticle[] = [
  {
    slug: "first-stand",
    title: "Your first stand in 10 minutes",
    summary:
      "Create a stand, add a product, print a QR, and run a test cash checkout.",
    videoUrl: "https://www.youtube.com/watch?v=qJeoTruQKMQ",
    related: [
      "sign-in-phone",
      "alerts-push",
      "customer-payments",
      "customer-choice-cart",
      "pre-order-pages",
      "pre-orders",
      "subscriptions",
      "stand-branding",
    ],
    ctas: [
      { label: "New Business", href: "/dashboard/businesses/new" },
      { label: "Add product", href: "/dashboard/products/new" },
    ],
    steps: [
      "Open My Businesses → New Business. Name it, pick a currency, and add short customer instructions if you want (e.g. where to leave cash).",
      "Set whether customers see exact stock counts or only Available / Low stock / Sold out, then save.",
      "Go to Products → Add product. Choose the business, name, price, starting stock, and a low-stock threshold, then save. (Skip this if you will use Customer Choice cart only - see Customer Choice cart.)",
      "Open the business → QR & print (or the QR link from My Businesses). Pick Product cart or Customer Choice, then print or download the sign.",
      "Put the QR at the stall. On another phone, scan it to open the public checkout page.",
      "Add the test product, choose Pay cash, confirm the amount, and tap that you have paid.",
      "Back in the owner app, check Orders and Inventory - the sale should appear and stock should drop by one.",
      "Turn on email and/or phone push in Settings so the next real sale alerts you automatically.",
    ],
  },
  {
    slug: "customer-choice-cart",
    title: "Customer Choice cart",
    summary:
      "Let shoppers enter dollar amounts at an unattended stall — no catalogue or stock. Available on Free and Pro.",
    videoUrl: null,
    omitVideo: true,
    related: ["first-stand", "customer-payments", "alerts-push"],
    ctas: [
      { label: "My Businesses", href: "/dashboard/businesses" },
    ],
    steps: [
      "Customer Choice is a stall (take-now) cart mode. It is not for pre-order pages or subscriptions.",
      "Open My Businesses → your business → QR & print. Under Cart mode, choose Customer Choice cart, then Save.",
      "Your stall QR now opens a calculator page: shoppers type each price they picked up (e.g. $10, then $5), see a running total, and pay with the same methods you enabled (cash, local transfer, card, PayPal).",
      "There is no product list and no inventory change. Orders still appear in Orders as a “Customer choice” line for the amount paid.",
      "Switch back to Product cart anytime on the same QR page if you want a catalogue and stock tracking again. Reprint the QR after changing mode so the code matches.",
      "Use Product cart when you sell named items with stock. Use Customer Choice when goods already have price tags and you only need a payment total.",
    ],
  },
];
