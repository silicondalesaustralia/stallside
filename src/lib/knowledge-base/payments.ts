import type { KnowledgeArticle } from "./types";

export const paymentArticles: KnowledgeArticle[] = [
  {
    slug: "payments-overview",
    title: "How payments work in Vendl",
    summary:
      "Cash, PayID, Stripe and Square: what each one is for, which to pick, and what it costs.",
    videoUrl: null,
    omitVideo: true,
    related: ["customer-payments", "connect-square", "square-sync", "billing"],
    ctas: [
      { label: "Payments settings", href: "/dashboard/settings/payments" },
      { label: "Billing", href: "/dashboard/settings/billing" },
    ],
    steps: [
      "Money always goes straight to your own account: cash in your tin, PayID to your bank, card payments to your Stripe or Square account. Vendl never holds your funds.",
      "Cash and PayID (Australia) need nothing connected and never have a Vendl fee.",
      "Stripe takes card, Tap & Go (Apple Pay / Google Pay) and pay-later. It is required for subscriptions, memberships, pre-order pages and deposits.",
      "Square (currently Australia only) takes card and wallet payments on your QR stall and website cart, and can sync products and stock both ways with Square POS. Good for market and in-person sellers who already use a Square reader.",
      "You can connect both. Under Settings → Payments → Product checkout provider, choose Stripe or Square for everyday product checkout. Subscriptions, memberships and pre-orders keep using Stripe either way.",
      "Vendl fee on Free: 2.5% + 30c on Stripe, 2.5% on Square. Accounts created before 2 Oct 2026 pay 2.5% on Stripe until they upgrade or connect Square. Stripe and Square also charge their own processing fees.",
      "Vendl Pro removes the Vendl fee on Square. On Stripe there is no Vendl fee on your first A$4,000 of sales each month, then 0.5%.",
      "Sales you take on your own Square reader or Square POS never have a Vendl fee.",
      "Card surcharges are not allowed in Australia, so Australian sellers always absorb the Vendl fee and customers pay the listed price. Outside Australia you can pass it on in Settings → Stripe.",
      "Already have a Stripe or Square account? Connecting takes a minute: sign in and approve Vendl. If not, you'll go through their sign-up and identity checks first.",
    ],
  },
];
