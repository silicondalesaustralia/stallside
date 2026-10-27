import type { KnowledgeArticle } from "./types";

export const billingArticles: KnowledgeArticle[] = [
  {
    slug: "billing",
    title: "Free and Vendl Pro",
    summary:
      "Free forever with every feature, or Pro to remove the Vendl card fee. The dashboard never locks.",
    keywords: ["pro", "plan", "price", "upgrade", "cancel", "subscription", "fee"],
    related: ["billing-region", "pass-card-fee", "payments-overview"],
    ctas: [{ label: "Vendl billing", href: "/dashboard/settings/billing" }],
    steps: [
      "Your Vendl plan is separate from the payments your customers make to you.",
      "Free is $0 a month with every feature. Vendl adds a 2.5% fee to card, Tap & Go and pay-later sales on Stripe, Square or PayPal. Cash and PayID are always free.",
      "Vendl Pro removes the Vendl fee. It costs A$19.99, US$14.99, £11.99 or €14.99 a month, depending on your billing region.",
      "To upgrade, open Settings → Vendl subscription → Manage subscription. On Vendl billing, check the Currency and tap Upgrade to Pro, then pay in Stripe Checkout. Promo codes are accepted there.",
      "To change your card or cancel, tap Manage payment method / cancel on the same page.",
      "If you cancel, you keep Pro until the end of the paid period, then return to Free and the card fee applies again. Your data stays.",
    ],
    tips: [
      "Stripe and Square processing fees apply on both plans. Those go to Stripe or Square, not Vendl.",
      "Outside Australia you can add the Vendl fee to the shopper's total instead of covering it (see Pass the card fee on to customers).",
    ],
  },
  {
    slug: "billing-region",
    title: "Set your billing region",
    summary:
      "Your region sets your Pro price currency, your Stripe country, and whether Square is available.",
    keywords: ["region", "country", "currency", "aud", "usd", "gbp", "eur"],
    related: ["billing", "customer-payments", "connect-square"],
    ctas: [{ label: "Vendl billing", href: "/dashboard/settings/billing" }],
    steps: [
      "Open Settings → Vendl subscription → Manage subscription.",
      "Under Change billing region, pick Australia (AUD), United States (USD), United Kingdom (GBP) or Europe (EUR) and tap Save region.",
      "The region sets the Pro price currency and the country your Stripe account is created in. Square is offered in Australia and the US.",
      "Set it before you connect Stripe or pay for Pro. After that the region is locked.",
    ],
    tips: [
      "If Square is connected to an account in another country, disconnect Square before changing region.",
      "Switching to the UK or Europe sets your checkout provider back to Stripe, since Square isn't available there.",
    ],
  },
];
