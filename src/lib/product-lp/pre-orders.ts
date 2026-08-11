import type { ProductLpContent } from "./types";

const PRE_SIGNUP = "/signup?utm_content=product-pre-orders";

export const PRE_ORDERS_HUB: ProductLpContent = {
  metaTitle: "Pre-orders - no website needed",
  metaDescription:
    "Take pre-orders in a minute. Deposits, order windows, make lists. No online store required.",
  canonical: "/pre-orders",
  eyebrow: "Vendl Pre-orders",
  headline: "You Will Make More Money With Vendl Pre-Orders",
  support:
    "Know what to make before you make it. Get paid before you hand it over. Share a link - Facebook, Instagram, WhatsApp - or print a QR for collection day.",
  chips: ["No website", "Make list included", "Deposits when you need them"],
  ctaLabel: "Start free",
  signupHref: PRE_SIGNUP,
  secondaryLabel: "See how it works ↓",
  stripHeading: "Everything a batch producer needs - nothing else",
  stripItems: [
    "Pre-order pages",
    "Unique page QR",
    "Order windows",
    "Hard caps",
    "Make list",
    "Packing list",
    "Deposits & balance",
    "Cart add-ons",
    "Volume price breaks",
    "Hide from business page",
  ],
  stripFootnote:
    "Buyers pay by card. Money goes to your Stripe account. No Shopify store required.",
  upsellHeading: "Grow each pre-order without another tool",
  upsellItems: [
    "Page-level cart add-ons",
    "Discounted “get this now” offers",
    "Volume price breaks on the sheet",
    "Exact slots left",
    "Buyer confirmation emails",
  ],
  upsellFootnote:
    "Share one link or QR per collection day. Upsells inherit that day’s payment and handover settings.",
  heroUpsellLabel: "Pre-order cart add-ons",
  heroUpsellDetail:
    "Offer “get this right now at a discount” on the same collection day - without a second checkout.",
  problemEyebrow: "The spreadsheet trap",
  problemHeadline: "Comments on a Facebook post. A bank transfer. A half-finished sheet.",
  problemBody:
    "That “system” breaks every busy week. Vendl turns one link into orders, payments, and a make list you can open before you start.",
  problemPoints: [
    "One public link or printed QR",
    "Paid orders with a close time and cap",
    "Totals by product for the day you bake or pack",
  ],
  problemFlow: ["Share link", "Orders in", "Get paid", "Open make list"],
  howHeading: "Up and running in three simple steps",
  howSupport: "Pick your trade, share the link, take orders.",
  steps: [
    {
      n: "01",
      title: "Set your catalogue and window",
      body: "Starter products for your trade, with orders-close and collection or delivery day.",
    },
    {
      n: "02",
      title: "Share the link",
      body: "Drop it in a group, story, or WhatsApp thread - or print a QR for the counter.",
    },
    {
      n: "03",
      title: "Make and pack from one board",
      body: "See totals to produce, then tick customers off as they collect or you deliver.",
    },
  ],
  proofEyebrow: "The flagship view",
  proofHeadline: "Open the make list before you start.",
  proofBody:
    "Production totals first. Packing by customer second. Printable labels when you need them - so you’re not handwriting bags at 4am.",
  proofBenefits: [
    "SKU totals for the day",
    "Order count and money taken",
    "Packing list with status",
    "Deposits and balance for long lead times",
    "Unique QR per pre-order page",
    "Cart add-ons on the same collection day",
  ],
  proofNote: "Every feature is included on Free. Pro only changes the Vendl card fee.",
  proofPanelTitle: "Example make list",
  proofPanelSubtitle: "Friday bake",
  proofStats: [
    { label: "Sourdough", value: "40" },
    { label: "Rye", value: "12" },
    { label: "Orders", value: "31" },
    { label: "Taken", value: "A$612" },
  ],
  proofRecentTitle: "Window closed Wed 6pm",
  proofRecentSub: "Collect Fri 3-5pm",
  objectionsHeading: "Built for people who don’t want a store",
  objectionsSupport:
    "Every other serious pre-order tool assumes you already have Shopify. Vendl doesn’t.",
  objections: [
    {
      q: "Do I need a website?",
      a: "No. Share a link or print a QR - buyers order and pay online.",
    },
    {
      q: "When do I get paid?",
      a: "Card is taken when they order (or as a deposit). Money goes to your Stripe account.",
    },
    {
      q: "Can I cap how many I take?",
      a: "Yes. Hard caps per product and an orders-close time. The window shuts itself.",
    },
    {
      q: "What about deposits?",
      a: "Optional. Take a percentage now and charge the balance before handover - built for longer lead times.",
    },
  ],
  testimonialQuote:
    "It was all so easy and fast to set up - your 10-minute setup was generous. I did it all in about three!",
  testimonialCite: "Marnie",
  testimonialPlace: "Melbourne, Australia",
  pricingEyebrow: "Start free. Pay only when a card sale is made.",
  pricingHeadline: "A$0 per month, with every Vendl feature.",
  pricingBody: [
    "Card sales on Free include a 2.5% Vendl fee, plus standard Stripe processing fees.",
    "Upgrade to Pro later to remove the Vendl fee. No monthly commitment on Free.",
  ],
  pricingIncluded: [
    "Multi-product pre-order pages",
    "Unique printable QR per page",
    "Order windows and hard caps",
    "Make list and packing list",
    "Deposits and balance charges",
    "Page cart add-ons and discounts",
    "Volume price breaks",
    "Hide products from the business page",
    "Buyer confirmation emails",
    "Printable order labels",
  ],
  pricingFullHref: "/pricing",
  closingHeadline: "Orders in. Guesswork out.",
  closingSupport: "Share a link today. Open a make list on your next production day.",
  closingNote: "A$0 monthly on Free · No website required",
  doorwaySectionHeading: "For your trade",
  doorwayLinks: [
    {
      href: "/pre-orders/bakers",
      label: "Bakers",
      blurb: "Bread and any baked good - make lists, pay upfront.",
    },
    {
      href: "/pre-orders/farm-stalls",
      label: "Farm stalls",
      blurb: "Order ahead of market day or a restock.",
    },
    {
      href: "/pre-orders/firewood",
      label: "Firewood",
      blurb: "Deposits, delivery addresses, route totals.",
    },
  ],
  heroVisual: "makeList",
};

function preDoorway(
  partial: Omit<
    ProductLpContent,
    | "pricingEyebrow"
    | "pricingHeadline"
    | "pricingBody"
    | "pricingIncluded"
    | "pricingFullHref"
    | "testimonialQuote"
    | "testimonialCite"
    | "testimonialPlace"
    | "ctaLabel"
    | "secondaryLabel"
    | "proofNote"
    | "heroVisual"
  > &
    Partial<Pick<ProductLpContent, "heroVisual" | "proofNote" | "testimonialExtra">>,
): ProductLpContent {
  const { heroVisual, proofNote, ...rest } = partial;
  return {
    ...PRE_ORDERS_HUB,
    doorwayLinks: undefined,
    doorwaySectionHeading: undefined,
    ctaLabel: "Start free",
    secondaryLabel: "See how it works ↓",
    proofNote: proofNote ?? PRE_ORDERS_HUB.proofNote,
    ...rest,
    heroVisual: heroVisual ?? "makeList",
  };
}

export const PRE_ORDER_DOORWAYS: Record<string, ProductLpContent> = {
  bakers: preDoorway({
    metaTitle: "Pre-order system for bakers - no website needed",
    metaDescription:
      "Take orders for bread and any baked good in a minute. Know what to bake before you bake it. Make list and packing list included.",
    canonical: "/pre-orders/bakers",
    signupHref: "/signup?vertical=bakers&utm_content=pre-orders-bakers",
    eyebrow: "For bakers",
    headline: "You Will Make More Money With Vendl Pre-Orders For Bakers",
    support:
      "Loaves, pastries, cookies, cakes, boxes - know what to bake before you bake it. Get paid before collection day. Share one link - not a comment thread.",
    chips: ["Make list at 4am", "Pay upfront", "Caps that close"],
    stripHeading: "What bakers open Vendl for",
    stripItems: [
      "Pre-order page + QR",
      "Bake totals",
      "Packing list",
      "Collection windows",
      "Slots left",
      "Cart add-ons",
      "Volume price breaks",
    ],
    stripFootnote:
      "Starter catalogue includes baked goods you can edit - price and cap in seconds.",
    problemEyebrow: "Bake day chaos",
    problemHeadline: "Forty DMs. One spreadsheet. Still not sure how many rye.",
    problemBody:
      "Hotplate-style drops shouldn’t require a store. Close the window Wednesday, bake Friday, pack from a list with names on it - bread or any baked good.",
    problemPoints: [
      "Orders close at a time you choose",
      "Hard caps so you don’t overbake",
      "Make list: 40 sourdough · 24 cookies · 8 focaccia",
    ],
    problemFlow: ["Share link", "Window closes", "Make list", "Hand over"],
    howHeading: "Three steps to a calmer bake day",
    howSupport:
      "Starter baked goods are pre-filled. Adjust price and cap, then share.",
    steps: [
      {
        n: "01",
        title: "Set your bake and the window",
        body: "Bread, pastries, cookies, cakes - orders-close and collection day.",
      },
      {
        n: "02",
        title: "Share the link",
        body: "Facebook group, Instagram story, WhatsApp - buyers pay by card.",
      },
      {
        n: "03",
        title: "Bake from the make list",
        body: "Production totals first, then packing slips per customer.",
      },
    ],
    proofEyebrow: "Open before you mix",
    proofHeadline: "Friday 14 Aug - make",
    proofBody:
      "One screen: bake totals, order count, money taken, window status. Then flip to packing with names and times.",
    proofBenefits: [
      "Aggregate bake quantities",
      "Per-customer packing ticks",
      "Printable order labels",
      "Exact slots left on the public page",
    ],
    proofPanelTitle: "Make list",
    proofPanelSubtitle: "Friday bake",
    proofStats: [
      { label: "Sourdough", value: "40" },
      { label: "Cookies", value: "24" },
      { label: "Focaccia", value: "8" },
      { label: "Taken", value: "A$612" },
    ],
    proofRecentTitle: "31 orders · window closed",
    proofRecentSub: "Collect Fri 3-5pm",
    objectionsHeading: "Baker questions",
    objectionsSupport:
      "For home bakeries and micro bakeries - bread and any baked good, not a full e‑commerce build.",
    objections: [
      {
        q: "Do I need a website?",
        a: "No. Share a link or print a QR - buyers order and pay online.",
      },
      {
        q: "When do I get paid?",
        a: "Card payment is taken when they order. Money goes to your Stripe account.",
      },
      {
        q: "How do I know what to bake?",
        a: "Open Collections for a make list by day - totals per item, then packing by customer.",
      },
      {
        q: "Is it only for bread?",
        a: "No. Any baked good - loaves, pastries, cookies, cakes, boxes - with caps and a make list.",
      },
      {
        q: "Can I show how many are left?",
        a: "Yes. Turn on exact slots for a public “3 left” style count.",
      },
    ],
    closingHeadline: "Bake what sold - not what you hoped.",
    closingSupport: "Start free. Share your first window this week.",
    closingNote: "A$0 monthly on Free · No website",
    heroVisual: "bakers",
  }),

  "farm-stalls": preDoorway({
    metaTitle: "Farm pre-orders for collection - no website needed",
    metaDescription:
      "Take farm orders ahead of market day or a restock. Buyers pay before they collect. Make list included.",
    canonical: "/pre-orders/farm-stalls",
    signupHref: "/signup?vertical=farm-stalls&utm_content=pre-orders-farm-stalls",
    eyebrow: "For farm sellers",
    headline: "You Will Make More Money At Your Farm With Vendl Pre-Orders",
    support:
      "Sell ahead of a market day or restock. Buyers pay before they collect - you pack from a list, not a pile of texts.",
    chips: ["Collection day", "Pay upfront", "Caps & windows"],
    stripHeading: "Built for boxes, eggs and seasonal lists",
    stripItems: [
      "Pre-order page + QR",
      "Order window",
      "Collection day",
      "Make list",
      "Buyer names",
      "Cart add-ons",
      "Volume price breaks",
    ],
    stripFootnote: "Starter catalogue includes eggs, veg box and honey - edit prices and caps.",
    problemEyebrow: "Market week",
    problemHeadline: "You’re cutting produce without knowing who actually paid.",
    problemBody:
      "A shared link with a hard close beats a comment thread. Open the make list the night before and pack with confidence.",
    problemPoints: [
      "Orders close before you harvest or pack",
      "Paid reservations with buyer details",
      "Totals per product for the collection day",
    ],
    problemFlow: ["Share link", "Orders close", "Pack list", "Hand over"],
    howHeading: "Three steps to a calmer collection day",
    howSupport: "Set the window, share it, pack from one board.",
    steps: [
      {
        n: "01",
        title: "List what’s available",
        body: "Eggs, boxes, honey - set caps so you don’t oversell.",
      },
      {
        n: "02",
        title: "Share for the week",
        body: "Post the link where your buyers already are.",
      },
      {
        n: "03",
        title: "Pack by name",
        body: "Make list for quantities, packing view for each customer.",
      },
    ],
    proofEyebrow: "Before you cut",
    proofHeadline: "Know how many boxes to pack.",
    proofBody:
      "See product totals and who’s collecting when - so market morning isn’t a scramble of unread messages.",
    proofBenefits: [
      "Paid orders only",
      "Collection day grouping",
      "Exact slots when you want them",
      "Email confirmations to buyers",
    ],
    proofPanelTitle: "Make list",
    proofPanelSubtitle: "Saturday collection",
    proofStats: [
      { label: "Veg boxes", value: "12" },
      { label: "Dozens", value: "30" },
      { label: "Orders", value: "28" },
      { label: "Taken", value: "A$540" },
    ],
    proofRecentTitle: "Window closed Thu 8pm",
    proofRecentSub: "Collect Sat 9-11am",
    objectionsHeading: "Farm pre-order questions",
    objectionsSupport: "For growers and farm sellers who need paid reservations - not a full online store.",
    objections: [
      {
        q: "Do buyers need an account?",
        a: "No. Name and email at checkout is enough.",
      },
      {
        q: "What if I sell out early?",
        a: "The order window closes when the cap is hit. You see who is collecting what by day.",
      },
      {
        q: "Can I change the collection note?",
        a: "Yes - add pickup instructions buyers see at checkout and in their email.",
      },
      {
        q: "Do I need a website?",
        a: "No. One link is enough.",
      },
    ],
    closingHeadline: "Pack what sold.",
    closingSupport: "Open a window for next market day in minutes.",
    closingNote: "A$0 monthly on Free · No website",
    heroVisual: "farmStalls",
    heroUpsellLabel: "Eggs cart add-on",
    heroUpsellDetail:
      "Offer a dozen eggs at checkout on the same collection day - “get this right now at a discount.”",
  }),

  firewood: preDoorway({
    metaTitle: "Firewood pre-orders with deposits - no website needed",
    metaDescription:
      "Take firewood orders with a deposit, charge the balance before delivery, and open a make list by suburb.",
    canonical: "/pre-orders/firewood",
    signupHref: "/signup?vertical=firewood&utm_content=pre-orders-firewood",
    eyebrow: "Firewood & bulk loads",
    headline:
      "You Will Make More Money Selling Firewood With Vendl Pre-Orders",
    support:
      "Take a deposit now, charge the balance before delivery. One make list for the route - grouped by suburb.",
    chips: ["30% deposit default", "Delivery addresses", "Route make list"],
    stripHeading: "Built for loads, not loaves",
    stripItems: [
      "Pre-order page + QR",
      "Deposits",
      "Balance charge",
      "Delivery day",
      "Suburb totals",
      "Cart add-ons",
      "Route make list",
    ],
    stripFootnote:
      "Balance stays on hold until it clears - you don’t hand over four cords against a $50 deposit.",
    problemEyebrow: "The whiteboard in the shed",
    problemHeadline: "A phone call, a deposit promised, a balance that never arrives.",
    problemBody:
      "Vendl takes the deposit on a card, saves it for the balance, and groups deliveries by area so the Saturday run is planned - not guessed.",
    problemPoints: [
      "Deposit now, balance before delivery",
      "Buyer address captured at checkout",
      "Make list grouped by suburb",
    ],
    problemFlow: ["Order + deposit", "Balance clears", "Load the ute", "Deliver"],
    howHeading: "Three steps to a cleaner wood season",
    howSupport: "Starter loads are pre-filled. Set deposit percent and delivery day.",
    steps: [
      {
        n: "01",
        title: "List your loads",
        body: "Mixed hardwood, redgum, kindling - caps and a delivery day.",
      },
      {
        n: "02",
        title: "Share the order link",
        body: "Buyers pay a deposit and enter a delivery address.",
      },
      {
        n: "03",
        title: "Run the route",
        body: "Make list by suburb. Balance must clear before you mark ready.",
      },
    ],
    proofEyebrow: "Before you split",
    proofHeadline: "Deliver Sat - 5 in Woodend, 3 in Kyneton.",
    proofBody:
      "See load totals and where they’re going. Orders with unpaid balances stay on hold until the charge clears.",
    proofBenefits: [
      "Deposit + auto balance",
      "Delivery addresses",
      "Suburb grouping",
      "Failed balance retries + buyer email",
    ],
    proofPanelTitle: "Make list",
    proofPanelSubtitle: "Saturday deliveries",
    proofStats: [
      { label: "Hardwood 1m³", value: "6" },
      { label: "Redgum", value: "2" },
      { label: "Woodend", value: "5" },
      { label: "Kyneton", value: "3" },
    ],
    proofRecentTitle: "Deposits taken · balances due Fri",
    proofRecentSub: "Deliver Sat",
    objectionsHeading: "Firewood questions",
    objectionsSupport: "For splitters and bulk sellers - deposits without chasing invoices.",
    objections: [
      {
        q: "How do deposits work?",
        a: "Buyers pay a deposit (default 30%) when they order. The balance is charged from their saved card before delivery.",
      },
      {
        q: "Do I deliver or do they collect?",
        a: "Delivery is the default - buyers enter an address. You can switch products to collection if you prefer.",
      },
      {
        q: "What if the balance charge fails?",
        a: "Vendl retries and emails the buyer a link. The load stays on hold until the balance clears.",
      },
      {
        q: "Do I need a website?",
        a: "No. Share a link or print a QR.",
      },
    ],
    closingHeadline: "Deposits in. Route planned.",
    closingSupport: "Open your first order window before the cold snap.",
    closingNote: "A$0 monthly on Free · No website",
    heroVisual: "firewood",
    heroUpsellLabel: "Kindling cart add-on",
    heroUpsellDetail:
      "Offer a bag of kindling at checkout on the same delivery day - “get this right now at a discount.”",
  }),
};
