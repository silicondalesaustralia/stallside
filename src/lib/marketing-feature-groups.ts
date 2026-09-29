export type MarketingFeatureGroup = {
  title: string;
  blurb: string;
  items: readonly string[];
};

/** "Run your whole business" grid on the home page and product landing pages. */
export const MARKETING_FEATURE_GROUPS: readonly MarketingFeatureGroup[] = [
  {
    title: "Stock & inventory",
    blurb: "Know what you have, what's selling, and when it runs out.",
    items: [
      "Inventory report: stock status, sold in 7 and 30 days, last sold",
      "Days of cover - see what runs out this week",
      "Stock value at cost and retail",
      "Stock count: count the shelves, fix every difference in one tap",
      "Spreadsheet import and export with a ready-made template",
      "Product status: In production, On order, Seasonal, Discontinued",
      "Search by name, SKU or barcode, with full stock history",
    ],
  },
  {
    title: "Your online shop",
    blurb: "A shop for every business is included - no website to build.",
    items: [
      "Your own shop link with your logo, colours and socials",
      "Categories with their own pages and a Shop menu",
      "Show all products or category tiles on your shop page",
      "Choose the order products appear in",
      "Product pages with options, bundle prices and freshness notes",
      "Search-friendly titles, descriptions and share images",
    ],
  },
  {
    title: "Customers & email",
    blurb: "Turn one-off buyers into regulars.",
    items: [
      "Customer list with orders, lifetime spend and notes",
      "Smart lists: bought a product recently, pre-order buyers, restock opt-ins",
      "Upload your own customer list from a spreadsheet",
      "Branded email campaigns with sent and click counts",
      "Email everyone collecting on a given day",
      "Unsubscribe and marketing consent handled for you",
    ],
  },
  {
    title: "Subscriptions & memberships",
    blurb: "Regular income from your regular customers.",
    items: [
      "Weekly, fortnightly or monthly boxes on card",
      "Memberships for a set number of weeks with a member cap",
      "Weekly, monthly or pay-in-full plans with benefits",
      "Weekly collections created automatically",
      "Shoppers skip, pause or cancel themselves",
    ],
  },
  {
    title: "Suppliers",
    blurb: "Sell a neighbour's goods alongside your own.",
    items: [
      "Invite a supplier to their own login",
      "They add stock to your products or list their own",
      "Approve stock before it goes on sale",
      "Oldest supplier stock sells first",
      "Running tally of what you owe, with Mark paid",
    ],
  },
  {
    title: "Run it from your phone",
    blurb: "Everything in one place, wherever you are.",
    items: [
      "Notifications inbox for orders, low stock and failed payments",
      "Sale alerts by email and push to your phone",
      "Sales by channel - stall, pre-orders, subscriptions - vs last period",
      "Multiple businesses under one login",
      "QR poster editor with live preview, printed at A4, half or quarter A4",
      "Step-by-step guides for every feature",
    ],
  },
];
