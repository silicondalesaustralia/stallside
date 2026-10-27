import type { KnowledgeArticle } from "./types";

export const paymentArticles: KnowledgeArticle[] = [
  {
    slug: "payments-overview",
    title: "How payments work in Vendl",
    summary:
      "Cash, PayID, Stripe and Square: what each one is for, which to pick, and what it costs.",
    keywords: ["fees", "card", "provider", "which", "compare", "payout"],
    related: ["customer-payments", "connect-square", "cash-payid", "checkout-provider", "billing"],
    ctas: [
      { label: "Payments", href: "/dashboard/payments" },
      { label: "Billing", href: "/dashboard/settings/billing" },
    ],
    steps: [
      "Money always goes straight to you: cash in your tin, PayID to your bank, card payments to your own Stripe or Square account. Vendl never holds your funds.",
      "Cash and PayID need nothing connected and never have a Vendl fee. PayID only shows on businesses priced in AUD. Neither can be used for subscriptions. For pre-orders without card, use Pay at pickup on the pre-order page.",
      "Stripe takes card, Tap & Go (Apple Pay / Google Pay) and pay-later on your QR stall and shop, plus pre-order pages, deposits, subscriptions and memberships. It works in Australia, the US, the UK and Europe.",
      "Square takes card and wallet payments for the same things, and can sync products and stock both ways with your Square reader or POS. It's available in Australia and the United States.",
      "Which to pick: choose Square if you already sell with a Square reader at markets and want stock to match. Choose Stripe if you sell in the UK or Europe, or want pay-later options like Zip, Klarna and Afterpay. You can connect both.",
      "With both connected, open Payments and choose your Product checkout provider. That choice covers product checkout, pre-orders and deposits across your whole account.",
      "On the Free plan, Vendl adds a 2.5% fee to card, Tap & Go and pay-later sales on Stripe, Square and PayPal. They also charge their own processing fees. Vendl Pro removes the Vendl fee.",
      "Sales you take on your own Square reader or Square POS never have a Vendl fee.",
    ],
    tips: [
      "Card surcharges aren't allowed in Australia, so Australian sellers always cover the Vendl fee. Elsewhere you can add it to the customer's total (see Pass the card fee on to customers).",
      "Newer Stripe accounts are paid out weekly on Mondays.",
      "Already have a Stripe or Square account? Connecting takes a minute: sign in and approve Vendl.",
    ],
  },
  {
    slug: "cash-payid",
    title: "Take cash and PayID",
    summary:
      "Let shoppers pay cash into your tin or transfer to your PayID, with no fees and nothing to connect.",
    availability: "PayID: AUD only",
    keywords: ["cash", "payid", "bank transfer", "honesty box", "local transfer", "free"],
    related: ["payments-overview", "customer-payments", "first-stand"],
    ctas: [{ label: "Payments", href: "/dashboard/payments" }],
    steps: [
      "Open Payments in the sidebar. Checkout payments shows the options for your selected business. Use the Business switcher to change business.",
      "Tick Cash. Shoppers will see Pay cash, the amount to put in your slot or cash box, and an I have paid cash button.",
      "For PayID (businesses priced in AUD only), tick PayID and fill in Your PayID: an Australian mobile number, email, ABN or organisation ID.",
      "Tap Save payment options. At least one payment method must stay on.",
      "Shoppers paying by PayID see your Stall PayID with a Copy button, transfer the money in their banking app, then tap I've paid.",
      "The order appears in Orders straight away, stock drops, and you get your usual sale alert.",
    ],
    tips: [
      "Vendl can't see your bank account, so PayID and cash orders are confirmed by the shopper, not checked by Vendl. Check your bank or tin as usual, then open the order and tap Mark paid.",
      "Cash and PayID can't be used for deposits or subscriptions. Those need Stripe or Square. Pre-order pages can use Pay at pickup instead.",
      "PayTo and Pay by Bank come through Stripe, not this PayID option.",
      "On Pro, if PayPal is offered, open Payments, tap the PayPal link to connect, turn on Show PayPal at checkout, then tick PayPal here. PayPal works for take-now checkout only.",
    ],
  },
  {
    slug: "checkout-provider",
    title: "Choose Stripe or Square for checkout",
    summary:
      "When both are connected, pick which one takes card payments for products, pre-orders and deposits.",
    availability: "Australia & US",
    keywords: ["provider", "switch", "stripe or square", "both"],
    related: ["payments-overview", "connect-square", "customer-payments"],
    ctas: [{ label: "Payments", href: "/dashboard/payments" }],
    steps: [
      "Connect Stripe (Payments → Stripe) and Square (see Connect Square). In Square, turn on Online Vendl payments.",
      "Open Payments. The Product checkout provider section appears once Square is connected.",
      "Choose Stripe or Square and tap Save provider. The choice applies to your whole account: product checkout, pre-order pages and deposits.",
      "On Payments, under Checkout payments for each business, tick Card / Tap & Go and/or Square, then tap Save payment options.",
      "Run a small test sale from your QR on another phone to check the payment lands where you expect.",
    ],
    tips: [
      "If the provider you picked isn't ready for a business, checkout falls back to the other one so shoppers can still pay.",
      "Subscriptions and memberships have their own Square switch on the Square settings page (see Subscriptions and memberships on Square).",
    ],
  },
];
