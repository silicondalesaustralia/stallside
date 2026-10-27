import type { KnowledgeArticle } from "./types";

export const stripeArticles: KnowledgeArticle[] = [
  {
    slug: "customer-payments",
    title: "Accept card with Stripe",
    summary:
      "Connect Stripe so shoppers can pay by card, Apple Pay, Google Pay and pay-later. Separate from your Vendl subscription.",
    videoUrl: "https://youtu.be/keo53YG_Nks",
    keywords: ["stripe", "card", "tap and go", "apple pay", "google pay", "connect"],
    related: ["payments-overview", "pass-card-fee", "stripe-payment-methods", "connect-square"],
    ctas: [
      { label: "Card / Tap & Go settings", href: "/dashboard/settings/stripe" },
      { label: "Payments", href: "/dashboard/payments" },
    ],
    steps: [
      "Open Payments and tap the Stripe link to open Card / Tap & Go. Tap Connect Stripe (it says Finish Stripe setup if you started before).",
      "Complete Stripe's onboarding with your business and bank details. Your Stripe country comes from your billing region.",
      "Back on Card / Tap & Go, tap Refresh status if it doesn't show as ready yet.",
      "Open Payments, tick Card / Tap & Go under Checkout payments and tap Save payment options. Repeat for each business (switch with the Business switcher).",
      "Scan your QR on another phone and run a small test card sale. The money goes to your Stripe account.",
    ],
    tips: [
      "On Free, Vendl adds a 2.5% fee to Stripe card, Tap & Go and pay-later sales. Pro removes it. Stripe's own processing fees apply on both plans.",
      "Newer accounts are paid out by Stripe weekly on Mondays.",
      "Prefer Square? See Connect Square. Australian and US sellers can use either, or both.",
    ],
  },
  {
    slug: "pass-card-fee",
    title: "Pass the card fee on to customers",
    summary:
      "On the Free plan outside Australia, choose whether you cover the 2.5% Vendl fee or add it to the shopper's total.",
    availability: "Free plan, outside Australia",
    keywords: ["surcharge", "fee", "absorb", "pass on", "card fee"],
    related: ["billing", "payments-overview", "customer-payments"],
    ctas: [{ label: "Card / Tap & Go settings", href: "/dashboard/settings/stripe" }],
    steps: [
      "Open Payments and tap the Stripe link.",
      "Find the Vendl fee box. Choose I'll cover the fee (the default) or Add the fee to the customer's total. It saves straight away.",
      "When added, shoppers see Subtotal, Card fee and Total at checkout, so the fee is clear.",
      "The setting applies to Stripe and Square checkout. Cash and PayID never have a fee.",
    ],
    tips: [
      "Card surcharges aren't allowed in Australia, so this choice is locked for Australian accounts and AUD checkouts.",
      "On Vendl Pro there's no Vendl fee to pass on.",
    ],
  },
  {
    slug: "stripe-payment-methods",
    title: "Pay-later and other Stripe payment methods",
    summary:
      "Turn on Zip, Klarna, Afterpay, PayTo and other methods your Stripe account supports.",
    keywords: ["zip", "klarna", "afterpay", "payto", "pay later", "bnpl", "methods"],
    related: ["customer-payments", "payments-overview", "pass-card-fee"],
    ctas: [{ label: "Card / Tap & Go settings", href: "/dashboard/settings/stripe" }],
    steps: [
      "Connect Stripe first and wait until charges are enabled.",
      "Open Payments, tap the Stripe link and scroll to Checkout payment methods.",
      "Switch methods on or off. Changes go straight to your Stripe account and apply from the next checkout.",
      "Methods marked Managed by Stripe platform settings can't be changed here.",
    ],
    tips: [
      "Zip and Klarna only appear on orders above the provider's minimum, usually around $30.",
      "Pre-orders are always card-only, so pay-later never shows on pre-order pages.",
      "PayTo (AUD) waits for Stripe to confirm before the sale is marked paid.",
      "Pay-later providers charge higher processing fees than cards.",
    ],
  },
];
