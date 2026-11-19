import type { SellCategory } from "./types";

export const SELL_CATEGORIES: SellCategory[] = [
  {
    id: "baking",
    label: "Baking",
    marketCount: 15,
    previewSlugs: ["cookies", "cakes", "bread", "sourdough", "cupcakes"],
  },
  {
    id: "food-drink",
    label: "Food & drink",
    marketCount: 20,
    previewSlugs: ["chocolates", "jam", "hot-sauce", "tea", "coffee"],
  },
  {
    id: "beauty-fragrance",
    label: "Beauty & fragrance",
    marketCount: 15,
    previewSlugs: ["soap", "candles", "wax-melts", "bath-bombs", "lip-balm"],
  },
  {
    id: "jewelry-accessories",
    label: "Jewellery & accessories",
    marketCount: 12,
    previewSlugs: [
      "earrings",
      "bracelets",
      "necklaces",
      "polymer-clay-jewelry",
      "hair-accessories",
    ],
  },
  {
    id: "clothing-textiles",
    label: "Clothing & textiles",
    marketCount: 16,
    previewSlugs: ["crochet", "knitwear", "handmade-bags", "quilts", "t-shirts"],
  },
  {
    id: "home-workshop",
    label: "Homewares & woodwork",
    marketCount: 16,
    previewSlugs: [
      "pottery",
      "wooden-products",
      "handmade-furniture",
      "resin-products",
      "wreaths",
    ],
  },
  {
    id: "art-custom",
    label: "Art & personalised goods",
    marketCount: 14,
    previewSlugs: [
      "art-prints",
      "greeting-cards",
      "stickers",
      "laser-cut-products",
      "3d-printed-products",
    ],
  },
  {
    id: "pets-toys",
    label: "Pets, toys & more",
    marketCount: 12,
    previewSlugs: [
      "dog-treats",
      "pet-bandanas",
      "soft-toys",
      "slime",
      "miniatures",
    ],
  },
];

export function getCategory(id: string): SellCategory | undefined {
  return SELL_CATEGORIES.find((c) => c.id === id);
}
