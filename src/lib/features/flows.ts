export type FeatureFlowNode = { label: string; detail: string };

export type FeatureFlow = {
  eyebrow: string;
  heading: string;
  nodes: FeatureFlowNode[];
};

export const FEATURE_FLOWS: Record<string, FeatureFlow> = {
  "online-shop": {
    eyebrow: "PROCESS FLOW",
    heading: "From catalogue to paid order.",
    nodes: [
      { label: "Add products", detail: "Photos, price, stock, variants" },
      { label: "Share shop link", detail: "Socials, poster or QR" },
      { label: "Customer browses", detail: "Categories and product pages" },
      { label: "Checkout", detail: "Card, wallet or local pay" },
      { label: "You fulfil", detail: "Order lands in the dashboard" },
    ],
  },
  "pre-orders": {
    eyebrow: "PROCESS FLOW",
    heading: "Sell the bake before you make it.",
    nodes: [
      { label: "Open window", detail: "Set open and close times" },
      { label: "Customers order", detail: "Deposit or pay in full" },
      { label: "Window closes", detail: "You know exact demand" },
      { label: "Make the batch", detail: "Produce what sold" },
      { label: "Collection day", detail: "Hand over on the schedule" },
    ],
  },
  subscriptions: {
    eyebrow: "PROCESS FLOW",
    heading: "Sign up once. Collect on repeat.",
    nodes: [
      { label: "Create plan", detail: "Rhythm, price, what’s in" },
      { label: "Customer joins", detail: "Pays on card" },
      { label: "Cycle runs", detail: "Collections created for you" },
      { label: "They manage", detail: "Skip, pause or cancel" },
      { label: "You fulfil", detail: "Same order list each week" },
    ],
  },
  "stall-checkout": {
    eyebrow: "PROCESS FLOW",
    heading: "Scan, choose, pay — you keep working.",
    nodes: [
      { label: "Print QR poster", detail: "A4, half or quarter" },
      { label: "Customer scans", detail: "Opens stall on their phone" },
      { label: "They choose", detail: "What they’re taking" },
      { label: "They pay", detail: "Card, PayID, cash recorded" },
      { label: "You get alert", detail: "Stock updates instantly" },
    ],
  },
  bundles: {
    eyebrow: "PROCESS FLOW",
    heading: "Set the deal once. It shows everywhere.",
    nodes: [
      { label: "Pick products", detail: "Singles you already sell" },
      { label: "Set volume or pack", detail: "Breaks or a fixed bundle" },
      { label: "Shows on page", detail: "Shop, pre-order, stall" },
      { label: "Customer saves", detail: "Clearer multi-buy price" },
      { label: "Stock adjusts", detail: "Each item in the pack" },
    ],
  },
  payments: {
    eyebrow: "PROCESS FLOW",
    heading: "Connect once. Money goes to you.",
    nodes: [
      { label: "Connect provider", detail: "Stripe, Square or PayPal" },
      { label: "Turn on methods", detail: "Cards, wallets, local pay" },
      { label: "Customer pays", detail: "Online or at the stall" },
      { label: "Provider settles", detail: "Funds to your account" },
      { label: "Order recorded", detail: "Refunds from Vendl if needed" },
    ],
  },
  inventory: {
    eyebrow: "PROCESS FLOW",
    heading: "Count, sell, adjust — stay honest.",
    nodes: [
      { label: "Set stock", detail: "Starting counts or import" },
      { label: "Sell anywhere", detail: "Shop, stall, pre-orders" },
      { label: "Stock drops", detail: "Automatic on each sale" },
      { label: "Watch reports", detail: "Days of cover, low stock" },
      { label: "Count & fix", detail: "Shelf count in one pass" },
    ],
  },
  orders: {
    eyebrow: "PROCESS FLOW",
    heading: "Every channel, one fulfilment list.",
    nodes: [
      { label: "Sale happens", detail: "Stall, shop or subscription" },
      { label: "Order created", detail: "Lines, customer, method" },
      { label: "You filter", detail: "By day, channel or status" },
      { label: "Fulfil", detail: "Pack, collect or deliver" },
      { label: "Refund if needed", detail: "From the same order page" },
    ],
  },
  suppliers: {
    eyebrow: "PROCESS FLOW",
    heading: "They add stock. You approve and settle.",
    nodes: [
      { label: "Invite supplier", detail: "Their own login" },
      { label: "They add stock", detail: "To your products or theirs" },
      { label: "You approve", detail: "Before it goes on sale" },
      { label: "Stock sells", detail: "Oldest supplier stock first" },
      { label: "Mark paid", detail: "Running tally of what you owe" },
    ],
  },
  calendar: {
    eyebrow: "PROCESS FLOW",
    heading: "See the week before it hits you.",
    nodes: [
      { label: "Orders come in", detail: "Pre-orders and memberships" },
      { label: "Events appear", detail: "Pick-ups and closes" },
      { label: "Plan production", detail: "Against what’s already sold" },
      { label: "Sync Google", detail: "Two-way if you want" },
      { label: "Run the day", detail: "Collect and make on schedule" },
    ],
  },
  customers: {
    eyebrow: "PROCESS FLOW",
    heading: "Every sale builds a list you can use.",
    nodes: [
      { label: "Customer buys", detail: "Shop, stall or pre-order" },
      { label: "Record updates", detail: "Orders and lifetime spend" },
      { label: "Build a list", detail: "By product, date or opt-in" },
      { label: "Follow up", detail: "Email, restock or offer" },
      { label: "They return", detail: "Regulars, not one-offs" },
    ],
  },
  "email-marketing": {
    eyebrow: "PROCESS FLOW",
    heading: "Right list. Branded send. Clear counts.",
    nodes: [
      { label: "Pick a list", detail: "Smart list or collection day" },
      { label: "Write the email", detail: "Your brand and colours" },
      { label: "Send or schedule", detail: "When it suits the drop" },
      { label: "Track opens", detail: "Sent and click counts" },
      { label: "Consent handled", detail: "Unsubscribe built in" },
    ],
  },
  social: {
    eyebrow: "PROCESS FLOW",
    heading: "One product becomes a week of posts.",
    nodes: [
      { label: "Pick a product", detail: "Photo you already have" },
      { label: "Generate design", detail: "Post or short clip" },
      { label: "Review", detail: "Captions and crop" },
      { label: "Schedule", detail: "Now or plan the week" },
      { label: "Publish", detail: "Instagram, Facebook, GBP" },
    ],
  },
  "restock-alerts": {
    eyebrow: "PROCESS FLOW",
    heading: "They ask once. You notify automatically.",
    nodes: [
      { label: "Item sells out", detail: "Opt-in shows on the page" },
      { label: "Customer waits", detail: "Joined the restock list" },
      { label: "You restock", detail: "Update stock as usual" },
      { label: "Alert sends", detail: "No spreadsheet chase" },
      { label: "They buy again", detail: "Back to your shop" },
    ],
  },
  costing: {
    eyebrow: "PROCESS FLOW",
    heading: "Materials in. Margin out.",
    nodes: [
      { label: "Add materials", detail: "Pack prices and units" },
      { label: "Build recipe", detail: "Batch, waste, labour" },
      { label: "Cost the unit", detail: "Overheads included" },
      { label: "Set margin", detail: "Price or margin either way" },
      { label: "Sell with confidence", detail: "Know what you keep" },
    ],
  },
  website: {
    eyebrow: "PROCESS FLOW",
    heading: "Edit, connect domain, publish.",
    nodes: [
      { label: "Choose a look", detail: "Layout and colours" },
      { label: "Edit pages", detail: "Home, about, blog" },
      { label: "Connect shop", detail: "Products and pre-orders" },
      { label: "Add domain", detail: "Your own web address" },
      { label: "Publish", detail: "Live for customers" },
    ],
  },
};

export const FEATURE_AUDIENCE: Record<string, string[]> = {
  "online-shop": ["Home producers", "Farm shops", "Makers with a catalogue"],
  "pre-orders": ["Bakers", "Weekly drops", "Seasonal makers"],
  subscriptions: ["Box schemes", "Soap clubs", "CSA-style shares"],
  "stall-checkout": ["Farm gates", "Markets", "Honesty boxes"],
  bundles: ["Multi-buys", "Gift packs", "Farm gate deals"],
  payments: ["AU / UK / US sellers", "Card and local pay", "Cash at the stand"],
  inventory: ["Perishable makers", "Multi-product stalls", "Growing catalogues"],
  orders: ["Anyone selling on more than one channel"],
  suppliers: ["Farm shops", "Shared stalls", "Co-ops"],
  calendar: ["Busy bake weeks", "Membership collections"],
  customers: ["Repeat buyers", "Email and restock follow-up"],
  "email-marketing": ["Launch days", "Collection reminders", "Win-backs"],
  social: ["Makers without a designer", "Weekly content plans"],
  "restock-alerts": ["Sold-out favourites", "Small-batch drops"],
  costing: ["Food producers", "Soap & candle makers", "Anyone pricing by recipe"],
  website: ["Branded storefronts", "Blog + shop", "Custom domain"],
};

export function getFeatureFlow(slug: string): FeatureFlow | undefined {
  return FEATURE_FLOWS[slug];
}

export function getFeatureAudience(slug: string): string[] {
  return FEATURE_AUDIENCE[slug] ?? [];
}
