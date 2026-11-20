import type { FeaturePage } from "@/lib/features/types";

export const GROW_FEATURES: FeaturePage[] = [
  {
    slug: "customers",
    title: "Customers & lists",
    menuBlurb: "Lifetime spend, notes and smart lists.",
    eyebrow: "KNOW YOUR BUYERS",
    plan: "FREE & PRO",
    metaTitle: "Customers & lists · Vendl",
    metaDescription:
      "Customer list with orders, lifetime spend and notes. Smart lists from what people bought, plus spreadsheet upload.",
    headline: "Turn one-off buyers into regulars.",
    support:
      "Every sale builds a customer record. Build smart lists from what people bought, then email or restock-alert the right people.",
    visual: "generic",
    bullets: [
      "Customer list with orders, lifetime spend and notes",
      "Smart lists: bought a product recently, pre-order buyers, restock opt-ins",
      "Upload your own customer list from a spreadsheet",
      "First-order discount and cart upsells",
    ],
    steps: [
      { title: "Capture buyers", body: "Checkout creates or updates the customer automatically." },
      { title: "Build a list", body: "Filter by product, date or restock opt-in." },
      { title: "Follow up", body: "Send email (Pro) or rely on automatic restock alerts." },
    ],
    faqs: [
      {
        q: "Can I import customers?",
        a: "Yes — upload a spreadsheet on Free. Pro adds broader platform import alongside products.",
      },
    ],
    relatedSlugs: ["email-marketing", "restock-alerts", "subscriptions"],
  },
  {
    slug: "email-marketing",
    title: "Email marketing",
    menuBlurb: "Branded campaigns to saved lists.",
    eyebrow: "STAY IN TOUCH",
    plan: "PRO",
    metaTitle: "Email marketing · Vendl",
    metaDescription:
      "Send branded email campaigns to saved lists or one customer at a time. Sent and click counts included on Pro.",
    headline: "Email the right customers.",
    support:
      "Send a campaign to a saved list — like everyone who bought soap lately — or email one customer. Consent and unsubscribe are handled for you.",
    visual: "email",
    bullets: [
      "Branded email campaigns with sent and click counts",
      "Email everyone collecting on a given day",
      "Unsubscribe and marketing consent handled for you",
      "Works with smart lists from your customer data",
    ],
    steps: [
      { title: "Pick the list", body: "Use a smart list or a collection-day group." },
      { title: "Write the email", body: "Brand it with your colours and send or schedule." },
      { title: "See who clicked", body: "Check sent and click counts after it goes out." },
    ],
    freeVsPro: {
      free: ["Customer list and restock alerts"],
      pro: ["Branded campaigns", "Collection-day emails", "Sent and click counts"],
    },
    faqs: [
      {
        q: "Is email on Free?",
        a: "Email marketing campaigns are Pro. Free still includes the customer list and restock sign-ups.",
      },
    ],
    relatedSlugs: ["customers", "social", "restock-alerts"],
  },
  {
    slug: "social",
    title: "Social posts & video",
    menuBlurb: "Posts, clips and a week of content from one place.",
    eyebrow: "SHOW UP ONLINE",
    plan: "FREE & PRO",
    metaTitle: "Social posts & video · Vendl",
    metaDescription:
      "Turn a product photo into branded posts, plan a week of content, and cut short vertical clips with captions.",
    headline: "One product. A post, a clip and a plan.",
    support:
      "Create branded posts for Instagram, Facebook and Google Business. Schedule them, plan a week at once, or turn a longer video into short clips.",
    visual: "social",
    bullets: [
      "Branded posts from a product photo",
      "Post now, schedule, or plan a whole week on the calendar",
      "Short vertical clips with captions from a longer video",
      "Pay-as-you-go credits on Free; monthly credits on Pro",
    ],
    steps: [
      { title: "Pick a product", body: "Start from something you already sell." },
      { title: "Generate the post or clip", body: "Review the design or captions before you publish." },
      { title: "Schedule it", body: "Add it to the calendar or post now." },
    ],
    table: {
      caption: "Social credits",
      headers: ["", "Free", "Pro"],
      rows: [
        ["Designs & clips", "Pay-as-you-go packs", "Monthly allowance + packs"],
        ["Video editor", "With credits", "Included with credits"],
      ],
    },
    faqs: [
      {
        q: "Do I need Pro for social?",
        a: "Anyone can use social with credit packs. Pro includes a monthly allowance of designs and video clips.",
      },
    ],
    relatedSlugs: ["email-marketing", "online-shop", "calendar"],
  },
  {
    slug: "restock-alerts",
    title: "Restock alerts",
    menuBlurb: "Tell waiting customers when it is back.",
    eyebrow: "BACK IN STOCK",
    plan: "FREE & PRO",
    metaTitle: "Restock alerts · Vendl",
    metaDescription:
      "Customers opt in when something is sold out. Restock alerts go out automatically when it is available again.",
    headline: "They asked to hear. You tell them once.",
    support:
      "When a product is sold out, customers can opt in. When you restock, alerts go out automatically — no manual chase list.",
    visual: "generic",
    bullets: [
      "Restock sign-ups customers can opt in to",
      "Alerts go out when stock returns",
      "Lists feed into your customer smart lists",
    ],
    steps: [
      { title: "Sell out", body: "Shoppers see the opt-in when stock is gone." },
      { title: "Restock", body: "Update stock as you normally would." },
      { title: "They hear automatically", body: "Waiting customers get the alert without a spreadsheet." },
    ],
    faqs: [
      {
        q: "Is this Free?",
        a: "Yes. Restock sign-ups and alerts are included on Free.",
      },
    ],
    relatedSlugs: ["customers", "inventory", "email-marketing"],
  },
];
