import type { KnowledgeArticle } from "./types";

export const inventoryArticles: KnowledgeArticle[] = [
  {
    slug: "inventory-report",
    title: "Inventory report",
    summary:
      "See every product's stock, status and sale rate, spot what's running out, and export to a spreadsheet.",
    keywords: ["stock", "inventory", "days cover", "export", "csv", "stock value", "low stock"],
    related: ["stock-count", "product-status", "square-sync"],
    ctas: [{ label: "Inventory", href: "/dashboard/inventory" }],
    steps: [
      "Open Products and tap the Inventory tab. The report covers your selected business.",
      "The tiles show product count, Low stock, Out of stock, Runs out ≤ 7 days, and your Stock value at cost and at retail.",
      "Each product shows In stock, Low stock (at or under its threshold) or Out of stock, plus any Inventory status you've set. Incoming means a supplier's stock is waiting for your approval.",
      "Sold 7d and Sold 30d count units sold. Per day is the 30-day average, and Days cover is how long your stock will last; it turns red at 7 days or less.",
      "Last sold helps you spot slow stock. Last counted shows when you last counted it.",
      "Tap a status pill to filter, or search by name, SKU or barcode.",
      "Tap Export CSV to download the current view for Excel, Numbers or Google Sheets.",
    ],
    tips: [
      "Products on a pre-order page are left out, because their stock is an order limit rather than stock on hand. Archived products are left out too.",
      "Add a Cost to products to fill in the stock value at cost.",
    ],
  },
  {
    slug: "stock-count",
    title: "Do a stock count",
    summary:
      "Count what's on your shelves, compare it with Vendl, and correct every difference in one go.",
    keywords: ["stocktake", "count", "variance", "import", "csv", "template"],
    related: ["inventory-report", "product-status", "edit-product"],
    ctas: [{ label: "Start stock count", href: "/dashboard/inventory?mode=count" }],
    steps: [
      "Open Products → Inventory and tap Start stock count.",
      "Each row shows the System count. Type what you counted in Counted; leave a row blank to skip it.",
      "Variance updates as you type: red means fewer than expected, green means more.",
      "Use the status pills or search to count one group at a time.",
      "Tap Apply count. Every changed product is set to your number, and its Last counted date updates.",
    ],
    tips: [
      "Prefer a spreadsheet? Tap Import CSV → Download template, fill in the On hand column, then Choose CSV file. Vendl shows every change before you tap Update.",
      "Imports can be up to 1 MB and 5,000 rows. Rows match by Product ID, then SKU, then name.",
      "CSV imports don't update Square; an on-screen count does.",
      "For one quick fix, open the product and use Stock → Set exact.",
    ],
  },
  {
    slug: "product-status",
    title: "Product status and search",
    summary:
      "Mark products as in production, on order, seasonal or discontinued, and find any product by name, SKU or barcode.",
    keywords: ["status", "seasonal", "discontinued", "on order", "search", "barcode", "sku"],
    related: ["inventory-report", "product-lifecycle"],
    ctas: [{ label: "Products", href: "/dashboard/products" }],
    steps: [
      "Open a product and go to the Stock card. Choose an Inventory status: None, In production, On order, Seasonal / paused or Discontinued. It saves straight away.",
      "The status shows on the Products list and the Inventory report. Shoppers don't see it.",
      "To find a product, use the search bar on Products. It matches name, SKU and barcode and keeps your current tab and filter. Tap Clear to see everything.",
    ],
    tips: [
      "To stop selling something, archive it. Discontinued keeps it listed until its stock runs out.",
      "Hidden products don't show on the Standard list. Use the Inventory report to find them.",
    ],
  },
];
