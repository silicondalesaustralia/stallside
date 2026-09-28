import type { KnowledgeArticle } from "./types";

export const productsInventoryArticles: KnowledgeArticle[] = [
  {
    slug: "inventory-report",
    title: "Inventory report",
    summary:
      "See every product's stock level, status, and sale rate in one place, spot what's running out, and export it to a spreadsheet.",
    videoUrl: null,
    omitVideo: true,
    related: ["stock-count", "product-status", "restock-emails"],
    ctas: [
      { label: "Inventory", href: "/dashboard/inventory" },
      { label: "Products", href: "/dashboard/products" },
    ],
    steps: [
      "Open Products → Inventory. The report covers the business you have selected. Pre-order products are left out because their stock is an order cap, not stock on hand.",
      "The tiles at the top show how many products you have, how many are low or out of stock, how many will run out within 7 days, and what your stock is worth at cost and at retail price. Products without a unit cost are counted in the hint under the cost tile.",
      "Every product gets a stock status worked out from its quantity: In stock, Low stock (at or below its low-stock threshold), or Out of stock. Incoming shows when a supplier has added stock that is waiting for your approval.",
      "If you set a status on a product (In production, On order, Seasonal / paused, Discontinued), it shows alongside, for example Out of stock · In production.",
      "Sold 7d and Sold 30d count units from paid orders. Per day is the 30-day average. Days cover is how long your current stock lasts at that rate; it turns red at 7 days or less.",
      "Last sold helps you spot slow or dead stock. Last counted shows when you last did a stock count for that product.",
      "Tap a status pill to filter, or search by name, SKU, or barcode.",
      "Tap Export CSV to download the current view. It opens in Excel, Numbers, or Google Sheets and includes unit price, unit cost, and stock value columns.",
    ],
  },
  {
    slug: "stock-count",
    title: "Do a stock count",
    summary:
      "Count what's physically on your shelves, compare it with Vendl, and correct every difference in one go.",
    videoUrl: null,
    omitVideo: true,
    related: ["inventory-report", "product-status"],
    ctas: [{ label: "Start stock count", href: "/dashboard/inventory?mode=count" }],
    steps: [
      "Open Products → Inventory and tap Start stock count.",
      "Each product shows the stock Vendl thinks you have. Type what you actually counted in the Counted box. Leave a row blank to skip it.",
      "Variance updates as you type: red means you have fewer than Vendl expected (spoiled, damaged, or sold without being recorded), green means more.",
      "Use the status pills or search to count one group at a time, for example just Low stock.",
      "Tap Apply count. Vendl sets each counted product to your number and records the change in its stock history as a stock count.",
      "Last counted on the report updates, so you can see what hasn't been checked in a while. Products that end up at or below their low-stock threshold trigger your usual low-stock alert.",
      "For a single quick fix, open the product and use Stock → Set exact instead.",
    ],
  },
  {
    slug: "product-status",
    title: "Product status and search",
    summary:
      "Mark products as in production, on order, seasonal, or discontinued, and find any product fast by name, SKU, or barcode.",
    videoUrl: null,
    omitVideo: true,
    related: ["inventory-report", "product-categories"],
    ctas: [{ label: "Products", href: "/dashboard/products" }],
    steps: [
      "Open a product and scroll to Stock. Choose an Inventory status: None, In production, On order, Seasonal / paused, or Discontinued. It saves as soon as you pick.",
      "In production: you're making more. On order: more is coming from a supplier. Seasonal / paused: not available right now but coming back. Discontinued: you won't restock it.",
      "The status shows as a badge on the Products list and on the Inventory report. It is for you only; shoppers don't see it.",
      "To stop selling a product, archive it instead. Discontinued keeps it listed with its remaining stock until you archive it.",
      "To find a product, use the search bar at the top of Products. It matches name, SKU, and barcode, and keeps you on the tab you're on (Standard, Pre Order, or Archived). Tap Clear to see everything again.",
    ],
  },
  {
    slug: "product-categories",
    title: "Categories in your shop",
    summary:
      "Group products into categories that shoppers can browse from your shop menu, and choose whether your shop page shows all products or category tiles.",
    videoUrl: null,
    omitVideo: true,
    related: ["shop-order", "product-status", "stand-branding"],
    ctas: [{ label: "Categories", href: "/dashboard/categories" }],
    steps: [
      "Open Products → Categories. Type a name (for example Vegetables) and tap Add category.",
      "On the category page, tick the products that belong in it and tap Save products. You can also add a product from its own page under Categories. A product can be in more than one category.",
      "A category appears in your shop menu once it has at least one visible product and is both Active and set to Show in shop menu. Untick Show in shop menu to keep it out of the menu while you set it up.",
      "With up to four categories they show as links next to Shop. With five or more they collapse into a Categories dropdown. On phones they're listed under Shop in the menu.",
      "Each category has its own page at your shop address followed by /c/category-name, which you can share or put on a sign.",
      "Under Shop page shows, pick All products to keep one long list, or Categories to show category tiles first. With Categories, products that aren't in any category still appear under Other products.",
      "Deleting a category only removes the grouping. Your products stay as they are.",
    ],
  },
  {
    slug: "shop-order",
    title: "Change the order of products",
    summary:
      "Choose the order products appear on your shop page, the order of your categories, and the order of products inside each category.",
    videoUrl: null,
    omitVideo: true,
    related: ["product-categories"],
    ctas: [
      { label: "Arrange shop order", href: "/dashboard/products?arrange=1" },
      { label: "Categories", href: "/dashboard/categories" },
    ],
    steps: [
      "Shop page: open Products and tap Arrange shop order. This sets the order of everything on your main shop page.",
      "Categories: open Products → Categories. The Menu order list sets the order of categories in your shop menu and on the category tiles.",
      "Inside a category: open the category. Product order in this category is separate from your shop page order, so bread can come first in Bakery and last on the main page.",
      "Move a product with the ↑ and ↓ arrows, or type a new position number and press Enter.",
      "Tap Save order when you're done. Nothing changes in your shop until you save.",
      "New products start near the top of your shop page, so open Arrange shop order to move them. Products newly added to a category go to the end of that category.",
    ],
  },
];
