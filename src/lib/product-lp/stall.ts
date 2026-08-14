import type { ProductLpContent } from "./types";

const STALL_SIGNUP = "/signup?utm_content=product-stall";

export const STALL_HUB: ProductLpContent = {
  metaTitle: "Unattended stall checkout",
  metaDescription:
    "Leave goods out. Buyers scan a QR, pay cash, PayID or card, and take. Instant sale alerts. No website needed.",
  canonical: "/stall",
  eyebrow: "Vendl Stall",
  headline: "You Will Make More Sales At Your Farm Stand With Vendl",
  support:
    "Print one QR for your stall. Buyers scan, choose what they’re taking, and pay on their phone - cash, PayID or card - even when nobody is there.",
  chips: ["A$0 monthly on Free", "No customer app", "Instant sale alerts"],
  ctaLabel: "Start free",
  signupHref: STALL_SIGNUP,
  secondaryLabel: "See how it works ↓",
  stripHeading: "",
  stripItems: [],
  stripFootnote: "",
  upsellHeading: "Built-in tools that grow the basket",
  upsellItems: [
    "Cart upsell",
    "First-order discount",
    "Volume price breaks",
    "“Only N left” scarcity",
    "Restock alerts",
  ],
  upsellFootnote:
    "Offer one more item at checkout, reward first visits, and nudge buyers when stock is low - without another app.",
  heroUpsellLabel: "Cart upsell built in",
  heroUpsellDetail:
    "Offer one more item at checkout - grow the basket without another app.",
  heroFeaturePoints: [
    {
      icon: "upsell",
      label: "Cart upsells that grow the basket",
      detail:
        "Offer one more item at checkout - grow the average order without another app.",
    },
    {
      icon: "subscription",
      label: "Subscriptions for recurring boxes",
      detail:
        "Weekly, fortnightly, or monthly boxes - predictable revenue without chasing DMs.",
    },
  ],
  problemEyebrow: "The sale you never see",
  problemHeadline: "Someone stops. Wants what you left out. Has no cash. Drives off.",
  problemBody:
    "That is a sale your cash tin cannot record. Vendl gives them another way to pay before they leave - without a terminal, staff member or complicated checkout.",
  problemPoints: [
    "One QR poster per stall",
    "Customers use their own phone",
    "You are alerted as soon as they confirm or pay",
  ],
  problemFlow: ["Stops at stall", "Scans QR", "Pays", "You get the sale"],
  howHeading: "Up and running in three simple steps",
  howSupport: "Print the QR, place it at your stall and let Vendl handle the rest.",
  steps: [
    {
      n: "01",
      title: "Print your stall QR",
      body: "Create your stall, add what you sell and print the ready-made A4 poster.",
    },
    {
      n: "02",
      title: "Customers scan and pay",
      body: "They choose what they are taking and pay by cash, PayID, card, Apple Pay or Google Pay. No app or account required.",
    },
    {
      n: "03",
      title: "You know instantly",
      body: "You receive a sale alert, the order is logged and your available stock updates automatically.",
    },
  ],
  proofEyebrow: "More than a payment QR",
  proofHeadline: "Know what sold, what is left and when to restock.",
  proofBody:
    "Every confirmed sale appears in your dashboard. Stock counts fall automatically, and low-stock alerts help you restock before the next customer arrives.",
  proofBenefits: [
    "Instant sale notifications",
    "Live stock counts",
    "Low-stock warnings",
    "Orders and sales history",
    "Restock notifications for regular customers",
  ],
  proofNote: "Every feature is included on Free. Pro only changes the Vendl card fee.",
  proofPanelTitle: "Example dashboard",
  proofPanelSubtitle: "Green Valley Eggs",
  proofStats: [
    { label: "Revenue (7d)", value: "A$491.00" },
    { label: "Orders", value: "47" },
    { label: "Dozen eggs left", value: "8" },
    { label: "Low stock", value: "2 items", warn: true },
  ],
  proofRecentTitle: "Recent sale · A$12.00",
  proofRecentSub: "Dozen eggs · PayID",
  objectionsHeading: "Made for the way honesty stalls already work",
  objectionsSupport:
    "Vendl does not replace the trust behind your stall. It gives honest customers more ways to pay and gives you a clearer record of what was taken.",
  objections: [
    {
      q: "Do I need a card machine?",
      a: "No. Customers pay on their own phones. You only need to print and display your Vendl QR poster.",
    },
    {
      q: "Do customers need an app?",
      a: "No. They scan the QR with their phone camera, choose what they are taking and pay in their browser.",
    },
    {
      q: "What if I'm not technical?",
      a: "Setup is designed to take only a few minutes. Add your products, print the poster and place it at your stall.",
    },
    {
      q: "Won't people just scan and not pay?",
      a: "Vendl works with the same honesty your stall already relies on. It makes paying easier for customers who intended to pay but arrived without enough cash, and logs each confirmed sale immediately.",
    },
  ],
  testimonialQuote:
    "It was all so easy and fast to set up - your 10-minute setup was generous. I did it all in about three!",
  testimonialExtra: "I was keen to try something that didn't have so many fees - like PayID.",
  testimonialCite: "Marnie",
  testimonialPlace: "Melbourne, Australia",
  pricingEyebrow: "Start free. Pay only when a card sale is made.",
  pricingHeadline: "A$0 per month, with every Vendl feature.",
  pricingBody: [
    "Cash and PayID have no Vendl fee. Card, Tap & Go and pay-later sales on Free include a 2.5% Vendl fee, plus standard Stripe processing fees.",
    "You can absorb the Vendl fee or pass it on to customers. Upgrade to Pro later to remove it.",
  ],
  pricingIncluded: [
    "Printable QR poster",
    "Cash, PayID, card and digital wallets",
    "Sale alerts and live stock tracking",
    "Cart upsell and first-order discount",
    "Volume price breaks and scarcity",
    "Restock notifications",
    "Your own stall branding",
  ],
  pricingFullHref: "/#pricing",
  closingHeadline: "Your stall, minus the missed sales.",
  closingSupport:
    "Set up your QR checkout in minutes and give every customer a way to pay.",
  closingNote: "A$0 monthly on Free · No terminal · No card details",
  doorwaySectionHeading: "Built for",
  doorwayLinks: [
    {
      href: "/stall/farm-gate",
      label: "Farm gate",
      blurb: "Eggs, honey, veg at the gate.",
    },
    {
      href: "/stall/honesty-parking",
      label: "Honesty parking",
      blurb: "Pay at the post without you standing there.",
    },
    {
      href: "/stall/campsites",
      label: "Campsites",
      blurb: "Firewood, ice and supplies on site.",
    },
    {
      href: "/stall/community-fridges",
      label: "Community fridges",
      blurb: "A printed QR beats an open tin.",
    },
  ],
  heroVisual: "stall",
};

function stallDoorway(
  partial: Omit<
    ProductLpContent,
    | "stripHeading"
    | "stripItems"
    | "stripFootnote"
    | "pricingEyebrow"
    | "pricingHeadline"
    | "pricingBody"
    | "pricingIncluded"
    | "pricingFullHref"
    | "testimonialQuote"
    | "testimonialExtra"
    | "testimonialCite"
    | "testimonialPlace"
    | "ctaLabel"
    | "signupHref"
    | "secondaryLabel"
    | "heroVisual"
    | "proofNote"
  > &
    Partial<Pick<ProductLpContent, "heroVisual" | "proofNote">>,
): ProductLpContent {
  return {
    ...STALL_HUB,
    doorwayLinks: undefined,
    doorwaySectionHeading: undefined,
    ctaLabel: "Start free",
    signupHref: STALL_SIGNUP,
    secondaryLabel: "See how it works ↓",
    proofNote: STALL_HUB.proofNote,
    heroVisual: "stall",
    ...partial,
  };
}

export const STALL_DOORWAYS: Record<string, ProductLpContent> = {
  "farm-gate": stallDoorway({
    metaTitle: "Farm-gate stall checkout",
    metaDescription:
      "QR checkout for the farm gate. Eggs, honey, veg - leave them out. Buyers scan, pay, and take.",
    canonical: "/stall/farm-gate",
    eyebrow: "Farm gate",
    headline: "QR checkout for the farm gate. No website needed.",
    support:
      "Eggs, honey, veg - leave them out. Buyers scan, pay, and take. You get the alert on your phone.",
    chips: ["Cash & PayID", "Card when ready", "Stock that updates"],
    problemEyebrow: "The empty tin problem",
    problemHeadline: "They wanted a dozen. They only had a card.",
    problemBody:
      "Farm-gate customers often arrive without cash. A printed QR lets them pay and take - while you’re in the paddock or at market.",
    problemPoints: [
      "Poster at the fridge or gate table",
      "Cash confirm or PayID on the spot",
      "Know what left before you get home",
    ],
    problemFlow: ["Pulls up", "Scans", "Pays", "Takes the eggs"],
    howHeading: "Three steps at the gate",
    howSupport: "Same honesty model - easier ways to pay.",
    steps: [
      {
        n: "01",
        title: "List what’s out today",
        body: "Dozen eggs, honey, seasonal veg - set prices and stock once.",
      },
      {
        n: "02",
        title: "Print the gate poster",
        body: "Ready-made A4 with your QR. Tape it where they already look.",
      },
      {
        n: "03",
        title: "Get the ping",
        body: "Sale alerts and stock counts update as people confirm payment.",
      },
    ],
    proofEyebrow: "Built for gate honesty",
    proofHeadline: "See what moved while you were elsewhere.",
    proofBody:
      "Your dashboard shows today’s sales and what’s left in the fridge - without a spreadsheet or guessing from an empty shelf.",
    proofBenefits: [
      "Instant sale alerts",
      "Live stock on each product",
      "Low-stock warnings",
      "Cash and PayID from day one",
    ],
    proofPanelTitle: "Example dashboard",
    proofPanelSubtitle: "Miller Rd gate",
    proofStats: [
      { label: "Today", value: "A$86.00" },
      { label: "Sales", value: "11" },
      { label: "Eggs left", value: "14" },
      { label: "Honey", value: "3 jars" },
    ],
    proofRecentTitle: "Recent sale · A$8.00",
    proofRecentSub: "Dozen eggs · Cash",
    objectionsHeading: "Farm-gate questions",
    objectionsSupport: "Designed for roadside fridges and gate tables - not a shopfront.",
    objections: [
      {
        q: "Do I need internet at the gate?",
        a: "Customers use their own phone data. You manage stock from wherever you have signal.",
      },
      {
        q: "Can people still leave cash?",
        a: "Yes. Cash self-confirm is built in alongside PayID and card.",
      },
      {
        q: "What about change?",
        a: "Exact cash or digital payment - no float required for card or PayID buyers.",
      },
      {
        q: "Is it only for eggs?",
        a: "No. Any goods you leave out - honey, veg, flowers, preserves.",
      },
    ],
    closingHeadline: "Your gate, minus the missed sales.",
    closingSupport: "Print the poster this afternoon. Take payment tonight.",
    closingNote: "A$0 monthly on Free · No terminal",
  }),

  "honesty-parking": stallDoorway({
    metaTitle: "Honesty parking payments",
    metaDescription:
      "Take honesty-box parking payments by QR. Cash or PayID at the post - know who paid.",
    canonical: "/stall/honesty-parking",
    eyebrow: "Honesty parking",
    headline: "Take honesty-box parking payments by QR.",
    support:
      "Cash or PayID at the post. Card when you connect Stripe. Know who paid without standing there all day.",
    chips: ["No attendant", "PayID ready", "Clear payment log"],
    problemEyebrow: "The honesty tin",
    problemHeadline: "They parked. They meant to pay. The tin was empty of change.",
    problemBody:
      "A QR on the post gives every driver a way to pay - and gives you a record instead of hoping the tin matches the cars.",
    problemPoints: [
      "Poster or sticker on the payment post",
      "Set a simple parking fee as a product",
      "See confirmed payments as they happen",
    ],
    problemFlow: ["Parks", "Scans", "Pays", "You’re notified"],
    howHeading: "Three steps for the car park",
    howSupport: "Same honesty model - better payment options.",
    steps: [
      {
        n: "01",
        title: "Add your parking fee",
        body: "One product - day rate, hour rate, or donation-style amount.",
      },
      {
        n: "02",
        title: "Put the QR on the post",
        body: "Print a small sign or sticker next to the honesty tin.",
      },
      {
        n: "03",
        title: "Reconcile from your phone",
        body: "Confirmed payments land in your order list with a timestamp.",
      },
    ],
    proofEyebrow: "Built for unattended parks",
    proofHeadline: "A clearer day than counting coins.",
    proofBody:
      "See how many drivers paid and by which method - without opening the tin after every session.",
    proofBenefits: [
      "Payment log by day",
      "Cash confirm + PayID",
      "Card when Stripe is connected",
      "No attendant required",
    ],
    proofPanelTitle: "Example dashboard",
    proofPanelSubtitle: "Riverside parking",
    proofStats: [
      { label: "Today", value: "A$140.00" },
      { label: "Payments", value: "28" },
      { label: "PayID", value: "19" },
      { label: "Cash", value: "9" },
    ],
    proofRecentTitle: "Recent · A$5.00",
    proofRecentSub: "Day parking · PayID",
    objectionsHeading: "Parking questions",
    objectionsSupport: "For honesty boxes and quiet lots - not gated ticket systems.",
    objections: [
      {
        q: "Can I keep the physical tin?",
        a: "Yes. Vendl sits beside it - drivers who prefer digital pay on their phone.",
      },
      {
        q: "Do drivers need an account?",
        a: "No. Scan, pay, done.",
      },
      {
        q: "What if signal is weak?",
        a: "Most phones have coverage where drivers already check maps. Cash remains available.",
      },
      {
        q: "Can I change the fee seasonally?",
        a: "Update the product price anytime from your phone.",
      },
    ],
    closingHeadline: "Your post, paid properly.",
    closingSupport: "Put a QR next to the tin and stop guessing who paid.",
    closingNote: "A$0 monthly on Free · No attendant",
  }),

  campsites: stallDoorway({
    metaTitle: "Campsite honesty checkout",
    metaDescription:
      "Sell firewood, ice and supplies at the campsite with a QR. Guests pay when you’re not around.",
    canonical: "/stall/campsites",
    eyebrow: "Campsites",
    headline: "Sell supplies at the site when you’re not around.",
    support:
      "Print a poster for firewood, ice, and camp store basics. Guests scan and pay - stock updates on your phone.",
    chips: ["Firewood & ice", "No shop hours", "Stock alerts"],
    problemEyebrow: "After dark demand",
    problemHeadline: "They need a bag of ice. The office closed an hour ago.",
    problemBody:
      "An honesty shelf with a QR keeps the site selling after hours - without leaving cash unsupervised as the only option.",
    problemPoints: [
      "Poster at the wood pile or fridge",
      "Guests pay on their phone",
      "You see what’s gone before morning",
    ],
    problemFlow: ["Needs ice", "Scans", "Pays", "Takes a bag"],
    howHeading: "Three steps on site",
    howSupport: "Set it up once. Restock when the alert says so.",
    steps: [
      {
        n: "01",
        title: "List site products",
        body: "Firewood bundles, ice, kindling, local eggs - whatever you leave out.",
      },
      {
        n: "02",
        title: "Place the QR",
        body: "Weatherproof poster or laminate near the goods.",
      },
      {
        n: "03",
        title: "Restock from alerts",
        body: "Low-stock warnings tell you what to refill on the next round.",
      },
    ],
    proofEyebrow: "Built for camp hosts",
    proofHeadline: "Know the shed before you drive out.",
    proofBody:
      "Overnight sales and remaining stock show up in one place - useful when you’re managing multiple sites.",
    proofBenefits: [
      "Overnight sale log",
      "Live stock per item",
      "Low-stock warnings",
      "Cash and digital pay",
    ],
    proofPanelTitle: "Example dashboard",
    proofPanelSubtitle: "Riverbend camp",
    proofStats: [
      { label: "Overnight", value: "A$96.00" },
      { label: "Bags ice", value: "4 left" },
      { label: "Wood", value: "11" },
      { label: "Low stock", value: "Ice", warn: true },
    ],
    proofRecentTitle: "Recent · A$15.00",
    proofRecentSub: "Firewood bundle · Card",
    objectionsHeading: "Campsite questions",
    objectionsSupport: "For honesty sheds and after-hours shelves - not a full POS.",
    objections: [
      {
        q: "Will guests understand it?",
        a: "If they can open a camera, they can scan. Copy on the poster says pay here.",
      },
      {
        q: "What about wet weather?",
        a: "Laminate the poster or use a small weatherproof frame - same as any site sign.",
      },
      {
        q: "Can prices differ by site?",
        a: "Yes. Each site can be its own stand with its own catalogue.",
      },
      {
        q: "Do I need Wi‑Fi in the shed?",
        a: "No. Guests use their phones. You sync when you have coverage.",
      },
    ],
    closingHeadline: "Your site store, open after hours.",
    closingSupport: "Print the QR once. Sell ice and wood while you sleep.",
    closingNote: "A$0 monthly on Free · No shop hours",
  }),

  "community-fridges": stallDoorway({
    metaTitle: "Community fridge checkout",
    metaDescription:
      "Simple pay-what-you-can or set prices at the community fridge. A printed QR beats an open tin.",
    canonical: "/stall/community-fridges",
    eyebrow: "Community fridges",
    headline: "A printed QR beats an open tin.",
    support:
      "Set prices or a suggested amount. Neighbours scan, pay, and take - you see what moved without hovering over the fridge.",
    chips: ["Suggested amounts", "Clear log", "No attendant"],
    problemEyebrow: "The honesty jar",
    problemHeadline: "The fridge is empty. The jar doesn’t explain what left.",
    problemBody:
      "A QR checkout logs each take with a payment method - useful for volunteers restocking and for donors who want to see the fridge working.",
    problemPoints: [
      "Poster on the fridge door",
      "Simple product list or donation amount",
      "A record of confirmed payments",
    ],
    problemFlow: ["Opens fridge", "Scans", "Pays", "Takes food"],
    howHeading: "Three steps for the fridge",
    howSupport: "Keep the community model - add a cleaner payment path.",
    steps: [
      {
        n: "01",
        title: "Add what’s usually stocked",
        body: "Bread, milk, produce - or a single suggested contribution.",
      },
      {
        n: "02",
        title: "Stick the QR on the door",
        body: "One clear poster: scan to pay for what you take.",
      },
      {
        n: "03",
        title: "Restock with data",
        body: "See popular items and quiet days without guessing.",
      },
    ],
    proofEyebrow: "Built for volunteers",
    proofHeadline: "Know what to bring next time.",
    proofBody:
      "A light sales history helps organisers restock what people actually take - not what sits.",
    proofBenefits: [
      "Payment confirmations",
      "Simple product list",
      "Cash and PayID options",
      "Works without staff on site",
    ],
    proofPanelTitle: "Example dashboard",
    proofPanelSubtitle: "Neighbourhood fridge",
    proofStats: [
      { label: "This week", value: "A$64.00" },
      { label: "Takes", value: "22" },
      { label: "Bread", value: "Low", warn: true },
      { label: "Milk", value: "6" },
    ],
    proofRecentTitle: "Recent · A$3.00",
    proofRecentSub: "Suggested amount · PayID",
    objectionsHeading: "Fridge questions",
    objectionsSupport: "For community fridges and shared pantries - keep it simple.",
    objections: [
      {
        q: "Can it be donation-based?",
        a: "Yes. List a suggested amount as the product price, or multiple amounts.",
      },
      {
        q: "Do people need to register?",
        a: "No. Scan and pay - same as any honesty model.",
      },
      {
        q: "Who gets the money?",
        a: "Straight to the organiser’s Stripe or cash - Vendl doesn’t hold funds.",
      },
      {
        q: "Is this only for Australia?",
        a: "Vendl works in multiple countries. PayID is Australia-only; other regions use local options.",
      },
    ],
    closingHeadline: "Your fridge, clearer for everyone.",
    closingSupport: "Put a QR on the door and stop relying on an empty jar.",
    closingNote: "A$0 monthly on Free · No attendant",
  }),
};
