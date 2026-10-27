import type { KnowledgeArticle } from "./types";

export const productionBatchArticles: KnowledgeArticle[] = [
  {
    slug: "production-batches",
    title: "Record a batch",
    summary:
      "Log what you made: ingredients come out of stock, the product's stock goes up, and its cost updates.",
    keywords: ["batch", "bake", "make", "batch code", "best before", "traceability", "undo"],
    related: ["production-recipes", "production-materials", "inventory-report"],
    ctas: [{ label: "Batches", href: "/dashboard/production" }],
    steps: [
      "Open Production (the Batches tab), or tap Make a batch on a recipe.",
      "Under Record a batch, pick the Recipe and how many Batches made (decimals are fine).",
      "Choose which product it Adds stock to, or No product for a sub-recipe or test.",
      "Check Sellable units made and enter what actually turned out.",
      "Add Made on, Best before and Notes. Leave Batch code on Auto or type your own to print on labels.",
      "Keep Update the product's unit cost from this batch ticked so your margins stay current. Tap Record batch.",
    ],
    tips: [
      "Materials can go below zero if you haven't recorded a delivery. A Reorder soon banner lists low materials.",
      "Product stock changes sync to Square and can trigger low-stock alerts.",
      "Tap Undo on a recent batch to put materials back and take its units off the product. The product's cost isn't changed back.",
    ],
  },
  {
    slug: "production-profit",
    title: "Profit & loss",
    summary:
      "See sales, cost of goods, fees and gross profit for any date range, and which products earn the most.",
    keywords: ["profit", "loss", "margin", "cogs", "report", "earnings"],
    related: ["production-recipes", "export-orders", "production-overview"],
    ctas: [{ label: "Profit & loss", href: "/dashboard/production/profit" }],
    steps: [
      "Open Production → Profit & loss. It shows the last 30 days; change the date range at the top.",
      "Profit and loss shows Sales, less GST, cost of goods sold, and platform and card fees, giving Gross profit and Gross margin.",
      "Production in this period shows what you spent on supplies and the cost of batches made.",
      "By product lists units, revenue, cost, profit and margin for each product.",
    ],
    tips: [
      "Only paid orders count.",
      "Supplies count as cost when the finished product sells, not when you buy them.",
      "If some units have no cost, set a Cost on the product or record a batch.",
    ],
  },
];
