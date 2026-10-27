import type { KnowledgeArticle } from "./types";

export const productionArticles: KnowledgeArticle[] = [
  {
    slug: "production-overview",
    title: "How Production works",
    summary:
      "Track ingredients, cost your recipes, record batches into stock, and see real profit per product.",
    keywords: ["production", "cost", "costing", "ingredients", "bakery", "make", "cogs"],
    related: ["production-materials", "production-recipes", "production-batches", "production-profit"],
    ctas: [{ label: "Production", href: "/dashboard/production" }],
    steps: [
      "Open Production in the sidebar. It has four tabs: Batches, Materials, Recipes and Profit & loss.",
      "Materials: add the ingredients and packaging you buy, with pack size and price.",
      "Recipes: list what one batch uses, plus waste, labour and overhead. Vendl works out the cost per batch and per unit.",
      "Link each recipe to the product it makes. Vendl shows the product's unit cost, margin and a suggested price.",
      "Batches: each time you make a batch, record it. Ingredients come out of stock, the product's stock goes up, and its cost updates.",
      "Profit & loss: see sales, cost of goods, fees and gross profit for any date range.",
    ],
    tips: [
      "Materials and recipes are shared across all your businesses. Batches, product links and profit are for the business you have selected.",
    ],
  },
  {
    slug: "production-materials",
    title: "Add materials and record supplies",
    summary:
      "Keep a list of ingredients and packaging with current prices and stock, and log each delivery.",
    keywords: ["material", "ingredient", "supplies", "purchase", "reorder", "flour", "packaging"],
    related: ["production-overview", "production-recipes"],
    ctas: [{ label: "Materials", href: "/dashboard/production/materials" }],
    steps: [
      "Open Production → Materials and open Add a material.",
      "Enter a Name and the Recipe unit your recipes use (g, kg, ml, L or each). Stock is tracked in this unit.",
      "Enter the Pack size and price, for example 10 kg for $18.50. Add Supplier, Stock on hand and Reorder at if you like, then tap Add material.",
      "When a delivery arrives, open Record incoming supplies. Pick the material and enter the Quantity received and Total paid (include delivery if you want it in your costs).",
      "Add a Lot / batch code and Use by date if you track them, then tap Record purchase. Stock goes up and the material's price updates to this purchase.",
      "Materials at or below their reorder level are flagged Reorder.",
    ],
    tips: [
      "The pack unit must be the same kind as the recipe unit: weight, volume or count.",
      "After a stocktake, correct Stock on hand on the material's page.",
      "Removing a purchase takes its quantity back out of stock but doesn't change the material's price.",
    ],
  },
  {
    slug: "production-recipes",
    title: "Cost a recipe and set your price",
    summary:
      "Build a recipe from materials, add waste, labour and overhead, link it to a product and get a suggested price.",
    keywords: ["recipe", "cost per unit", "margin", "pricing", "labour", "overhead", "waste", "markup"],
    related: ["production-materials", "production-batches", "production-profit"],
    ctas: [{ label: "Recipes", href: "/dashboard/production/recipes" }],
    steps: [
      "Open Production → Recipes. Under New recipe, enter a Name, what One batch makes (for example 12) and the Unit name (cookies), then tap Create recipe.",
      "Under What one batch uses, pick a material (or another recipe) from Add, enter the quantity and unit, and tap Add line.",
      "In Recipe settings, add Waste / failure %, Labour minutes per batch and your Labour rate, plus any Overhead per batch. Tap Save recipe.",
      "The Batch cost card shows materials, labour, overhead, the batch total and the cost per unit.",
      "Under Products and pricing, pick the Product made from this recipe, how many units go in each product (for example a box of 6), and Packaging ($/unit). Tap Link product.",
      "Use the pricing calculator: set a Target margin and fees to see a Suggested price and the profit at your current price.",
    ],
    tips: [
      "Set a labour rate to pay yourself. $0 hides what your time is worth.",
      "Problems such as a material with no price show in red on the cost card.",
      "The calculator's default fees assume the Free plan card fee plus card processing. Set fees to 0 for cash sales or Pro.",
      "Each product can be linked to one recipe.",
    ],
  },
];
