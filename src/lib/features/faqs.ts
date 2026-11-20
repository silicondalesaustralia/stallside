import type { FeatureFaq } from "@/lib/features/types";

/** Canonical FAQs per feature (overrides thin inline lists). */
export const FEATURE_FAQS: Record<string, FeatureFaq[]> = {
  "online-shop": [
    {
      q: "Do I need a website to sell?",
      a: "No. Free includes a shop link you can share. Pro adds Web Studio and a custom domain when you want a full site.",
    },
    {
      q: "Can customers buy from the shop?",
      a: "Yes. Connect Stripe or Square (PayPal on Pro) and customers pay on their phone or computer.",
    },
    {
      q: "Can I organise products into categories?",
      a: "Yes. Categories get their own pages and can appear in a Shop menu. You choose product order and whether the front shows all products or category tiles.",
    },
    {
      q: "Do variants and bundles work on the shop?",
      a: "Yes. Product options, volume pricing and bundles show on product pages alongside freshness notes and share images.",
    },
    {
      q: "Is the shop link on Free forever?",
      a: "Yes. The shop link with logo, colours and socials stays on Free. Pro unlocks the full website builder on top.",
    },
  ],
  "pre-orders": [
    {
      q: "Are pre-orders on Free?",
      a: "Yes. Pre-order pages with order windows and deposits are included on Free.",
    },
    {
      q: "Can I take a deposit instead of full payment?",
      a: "Yes. Set deposits or full payment at checkout when you create the pre-order page.",
    },
    {
      q: "What happens when the window closes?",
      a: "New orders stop. You keep the list of what sold so you can make exactly that amount for collection day.",
    },
    {
      q: "Can customers choose a collection day?",
      a: "Yes. Offer collection days they pick from when they order.",
    },
    {
      q: "Do pre-orders affect stock?",
      a: "Orders appear in your order list and stock updates when you fulfil — so you are not guessing walk-up demand.",
    },
  ],
  subscriptions: [
    {
      q: "Can customers pause or cancel themselves?",
      a: "Yes. Skip, pause and cancel are available to the shopper so you are not chasing emails.",
    },
    {
      q: "What rhythms can I offer?",
      a: "Weekly, fortnightly or monthly boxes on card, plus memberships for a set number of weeks with a member cap.",
    },
    {
      q: "Are subscriptions on Free?",
      a: "Yes. Subscriptions and memberships are included on Free.",
    },
    {
      q: "How do collections get created?",
      a: "Weekly collections are created automatically from the plan so fulfilment stays on a predictable rhythm.",
    },
    {
      q: "Can I mix subscriptions with one-off shop sales?",
      a: "Yes. Members and shop buyers share the same products, stock and order tools.",
    },
  ],
  "stall-checkout": [
    {
      q: "Do I need a card reader?",
      a: "No. Customers pay on their phone after scanning your QR code.",
    },
    {
      q: "What can I print?",
      a: "A ready-made poster with your business name and pay methods, at A4, half or quarter A4.",
    },
    {
      q: "Will I know when someone pays?",
      a: "Yes. Sale alerts go out by email and push when a payment succeeds — even if you are not standing at the stall.",
    },
    {
      q: "Does stall stock sync with the online shop?",
      a: "Yes. Stock counts update as you sell at the stand and online.",
    },
    {
      q: "Is there a longer stall guide?",
      a: "Yes — see /stall for niche examples and doorway pages.",
    },
    {
      q: "What’s the difference on Pro?",
      a: "Free includes the main QR and poster with a 2.5% Vendl fee on card sales. Pro removes that fee and adds more QR codes.",
    },
  ],
  bundles: [
    {
      q: "Is volume pricing Free or Pro?",
      a: "Volume and bundle pricing are included on Free.",
    },
    {
      q: "Where do deals show?",
      a: "On product pages across the shop, pre-orders and stall — customers see single and pack prices together.",
    },
    {
      q: "Does a bundle reduce stock for every item?",
      a: "Yes. When a pack sells, stock updates for each product in the bundle.",
    },
    {
      q: "Can I change a deal later?",
      a: "Yes. Edit volume breaks or bundle contents whenever the season or batch size changes.",
    },
  ],
  payments: [
    {
      q: "Where does the money go?",
      a: "Straight to your Stripe, Square or PayPal account. Vendl does not hold your funds.",
    },
    {
      q: "What is the Vendl fee?",
      a: "Free has a 2.5% Vendl fee on card, Tap & Go and pay-later. Pro has none. Provider processing fees apply on both plans. Cash and local bank methods like PayID have no Vendl fee.",
    },
    {
      q: "Is PayPal on Free?",
      a: "PayPal checkout is Pro. Stripe and Square are available on Free.",
    },
    {
      q: "Can I take cash at the stall?",
      a: "Yes. Record cash with no Vendl fee so honesty-box and market sales stay in the same order history.",
    },
    {
      q: "Do you handle sales tax?",
      a: "Yes. GST, VAT and US sales tax options are available depending on your setup.",
    },
  ],
  inventory: [
    {
      q: "Can I import stock?",
      a: "Spreadsheet import and export are available. Pro adds fuller data import from other platforms.",
    },
    {
      q: "What is days of cover?",
      a: "It estimates how long current stock will last from recent sales — so you see what runs out this week.",
    },
    {
      q: "How do stock counts work?",
      a: "Count the shelves and fix every difference in one pass. Sales from shop and stall already reduce the running total.",
    },
    {
      q: "Can I mark seasonal or discontinued products?",
      a: "Yes. Status labels include In production, On order, Seasonal and Discontinued.",
    },
    {
      q: "Does inventory include cost value?",
      a: "Reports can show stock value at cost and retail so you know what is sitting on the shelf.",
    },
  ],
  orders: [
    {
      q: "Do stall sales show up here?",
      a: "Yes. QR stall checkouts create the same order records as online sales.",
    },
    {
      q: "Can I refund from Vendl?",
      a: "Yes. Issue refunds from the orders page without leaving your dashboard.",
    },
    {
      q: "Can I see sales by channel?",
      a: "Yes. Compare stall, pre-orders, subscriptions and shop against the last period.",
    },
    {
      q: "Will I get notified of new sales?",
      a: "Sale alerts go out by email and push so you know when something sells — including at an unattended stand.",
    },
    {
      q: "Are orders on Free?",
      a: "Yes. Full order details are part of Free.",
    },
  ],
  suppliers: [
    {
      q: "Do suppliers see my whole business?",
      a: "No. They get a supplier login scoped to the products and stock they work with.",
    },
    {
      q: "Who controls what goes on sale?",
      a: "You do. Approve supplier stock before it appears for customers.",
    },
    {
      q: "How is stock sold when both of us supply an item?",
      a: "Oldest supplier stock sells first so ageing produce or batches move in a fair order.",
    },
    {
      q: "How do I know what I owe?",
      a: "A running tally shows the balance. Mark paid when you settle with them.",
    },
    {
      q: "Is suppliers on Free?",
      a: "Yes. Supplier logins and approval are included on Free.",
    },
  ],
  calendar: [
    {
      q: "Is the calendar on Free?",
      a: "Calendar is Pro. Free still shows order lists and collection details without the full calendar view.",
    },
    {
      q: "Does it sync with Google Calendar?",
      a: "Yes. Two-way Google Calendar sync is available on Pro so phone and Vendl stay aligned.",
    },
    {
      q: "What appears on the calendar?",
      a: "Pick-ups, pre-order closes and production days — so the week is visible before it hits you.",
    },
    {
      q: "Can I plan production against sales?",
      a: "Yes. Use what’s already ordered to schedule make days instead of guessing.",
    },
  ],
  customers: [
    {
      q: "Can I import customers?",
      a: "Yes — upload a spreadsheet on Free. Pro adds broader platform import alongside products.",
    },
    {
      q: "What is a smart list?",
      a: "A saved filter — for example everyone who bought soap in the last 90 days, pre-order buyers, or restock opt-ins.",
    },
    {
      q: "Do I see lifetime spend?",
      a: "Yes. Each customer record includes orders, lifetime spend and notes.",
    },
    {
      q: "How does this connect to email?",
      a: "On Pro, send campaigns to a smart list. On Free you still have the list plus restock alerts.",
    },
    {
      q: "Are customer tools on Free?",
      a: "Yes. Customer list, smart lists and restock sign-ups are on Free.",
    },
  ],
  "email-marketing": [
    {
      q: "Is email on Free?",
      a: "Branded campaigns are Pro. Free still includes the customer list and restock sign-ups.",
    },
    {
      q: "Can I email one collection day?",
      a: "Yes. Email everyone collecting on a given day — useful the morning of a pick-up.",
    },
    {
      q: "Do you handle unsubscribe?",
      a: "Yes. Unsubscribe and marketing consent are handled for you.",
    },
    {
      q: "Can I see who clicked?",
      a: "Campaigns include sent and click counts so you know what landed.",
    },
    {
      q: "Can I email one customer?",
      a: "Yes. Send to a saved list or to one person from their customer record.",
    },
  ],
  social: [
    {
      q: "Do I need Pro for social?",
      a: "Anyone can use social with credit packs. Pro includes a monthly allowance of designs and video clips.",
    },
    {
      q: "Which platforms can I post to?",
      a: "Branded posts for Instagram, Facebook and Google Business, with scheduling and a weekly planner.",
    },
    {
      q: "Can I make short video clips?",
      a: "Yes. Turn a longer video into short vertical clips with captions for Reels and TikTok-style posts.",
    },
    {
      q: "How do credits work?",
      a: "Designs and clips use credits. Pro includes a monthly allowance; anyone can buy extra packs.",
    },
    {
      q: "Can I plan a whole week?",
      a: "Yes. Build several posts at once, review the designs, then add them to the calendar.",
    },
  ],
  "restock-alerts": [
    {
      q: "Is this Free?",
      a: "Yes. Restock sign-ups and alerts are included on Free.",
    },
    {
      q: "How do customers opt in?",
      a: "When a product is sold out, they can join the wait list from the product page.",
    },
    {
      q: "When do alerts send?",
      a: "When you restock, waiting customers are notified automatically — no manual spreadsheet.",
    },
    {
      q: "Do opt-ins show in customer lists?",
      a: "Yes. Restock opt-ins feed into smart lists so you can follow up later if you want.",
    },
  ],
  costing: [
    {
      q: "Is costing on Free?",
      a: "Full recipes, batches and P&L are Pro. Anyone can try the costing calculator on the marketing home page.",
    },
    {
      q: "What goes into a batch cost?",
      a: "Materials with pack prices, waste, labour minutes, hourly rate and overhead — then a per-unit cost with packaging.",
    },
    {
      q: "Can I price from margin or from a target price?",
      a: "Yes. Type a margin to get a price, or a price to see your margin. Card fee estimates are optional context.",
    },
    {
      q: "What is AI invoice scanning?",
      a: "A Pro shortcut to pull materials and pack prices from supplier invoices instead of typing every line.",
    },
    {
      q: "Does costing connect to profit & loss?",
      a: "Pro includes P&L so recipe-level costs sit alongside the wider business picture.",
    },
  ],
  website: [
    {
      q: "Can I keep my current website?",
      a: "Yes. Share Vendl shop or selling links from your existing site, or move to Web Studio when you are ready.",
    },
    {
      q: "Is Web Studio on Free?",
      a: "No. Free includes the shop link. Web Studio, custom domain, blog, reviews, tags and pixels are Pro.",
    },
    {
      q: "Can I use my own domain?",
      a: "Yes on Pro. Start on a Vendl subdomain, then connect your own address. Domain purchase costs extra.",
    },
    {
      q: "Can the site sell pre-orders and memberships?",
      a: "Yes. Products, pre-orders and memberships sit on the same published site.",
    },
    {
      q: "Do you support tags and pixels?",
      a: "Yes on Pro — for ads and analytics — plus URL redirects when you move pages.",
    },
  ],
};

export function getFeatureFaqs(slug: string, fallback: FeatureFaq[] = []): FeatureFaq[] {
  return FEATURE_FAQS[slug] ?? fallback;
}
