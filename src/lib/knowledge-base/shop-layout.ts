import type { KnowledgeArticle } from "./types";

export const shopLayoutArticles: KnowledgeArticle[] = [
  {
    slug: "product-categories",
    title: "Categories in your shop",
    summary:
      "Group products into categories shoppers can browse from your shop menu, and choose whether your shop shows all products or category tiles.",
    keywords: ["category", "group", "menu", "collection", "tiles"],
    related: ["shop-order", "add-product", "stand-branding"],
    ctas: [{ label: "Categories", href: "/dashboard/categories" }],
    steps: [
      "Open Products and tap the Categories tab. Type a New category name (for example Vegetables) and tap Add category.",
      "On the category page, tick the products that belong in it and tap Save products. You can also add a product from the Categories card on its own page. A product can be in several categories.",
      "Keep Active and Show in shop menu ticked and tap Save. Untick Show in shop menu to hide it while you set it up.",
      "In your shop, Shop becomes a menu with All products and each category. On phones the categories are listed under Shop.",
      "Each category has its own link (your shop address followed by /c/category-name) you can share.",
      "Under Shop page shows, choose All products for one list or Categories for category tiles first, then tap Save.",
    ],
    tips: [
      "Categories are shared across your businesses. Each shop only shows categories that have visible products in that business.",
      "With the Categories layout, products in no category appear under Other products.",
      "Renaming a category changes its link.",
      "Delete category removes only the grouping, straight away. Your products stay.",
      "Customer Choice cart shops don't show a category menu.",
    ],
  },
  {
    slug: "shop-order",
    title: "Change the order of products",
    summary:
      "Choose the order of products on your shop page, the order of your categories, and the order inside each category.",
    keywords: ["sort", "order", "arrange", "reorder", "position"],
    related: ["product-categories"],
    ctas: [
      { label: "Arrange shop order", href: "/dashboard/products?arrange=1" },
      { label: "Categories", href: "/dashboard/categories" },
    ],
    steps: [
      "Shop page: open Products (Standard tab) and tap Arrange shop order.",
      "Categories: on the Categories tab, Menu order sets the order in your shop menu and tiles.",
      "Inside a category: open the category and use Product order in this category. It's separate from your shop page order.",
      "Move items with the ↑ and ↓ arrows, or type a position and press Enter.",
      "Tap Save order. Nothing changes in your shop until you save.",
    ],
    tips: [
      "New products start near the top of your shop page. Products newly added to a category go to the end of it.",
      "Hidden and archived products aren't in the list.",
    ],
  },
];
