/** Synthetic catalogue for testing accounts (no real seller data). */
export const MOCK_IMAGE = "/demo/kits/green-valley/packshot-eggs.png";

export type MockCategory = { slug: string; title: string; description: string; bottomDescription: string };

export type MockProduct = {
  slug: string;
  name: string;
  category: string;
  description: string;
  price: number;
  compareAt?: number;
  cost: number;
  stock: number;
  freshness?: string;
  fulfilment: "PICKUP" | "DELIVERY" | "BOTH";
  preOrderEligible?: boolean;
  tiers?: { qty: number; total: number }[];
  options?: { name: string; choices: { name: string; delta: number }[] };
};

export const MOCK_CATEGORIES: MockCategory[] = [
  {
    slug: "eggs",
    title: "Eggs",
    description: "Free-range eggs from our own flock, collected daily.",
    bottomDescription: "Our hens roam open paddocks and are fed a grain mix with no added colourants.",
  },
  {
    slug: "pantry-and-bakes",
    title: "Pantry & Bakes",
    description: "Small-batch bakes, preserves and pantry staples made with our eggs.",
    bottomDescription: "Everything is made in our registered farm kitchen in small batches each week.",
  },
];

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    slug: "free-range-eggs-dozen", name: "Free-range eggs (dozen)", category: "eggs", price: 8, cost: 3.2, stock: 40,
    description: "A dozen mixed-size free-range eggs with rich orange yolks. Collected this morning.",
    freshness: "Laid this morning", fulfilment: "BOTH", tiers: [{ qty: 2, total: 15 }, { qty: 3, total: 21 }],
  },
  {
    slug: "free-range-eggs-half-dozen", name: "Free-range eggs (half dozen)", category: "eggs", price: 4.5, cost: 1.7,
    stock: 30, description: "Six free-range eggs — perfect for a weekend breakfast.", freshness: "Laid this morning",
    fulfilment: "BOTH",
  },
  {
    slug: "jumbo-eggs-dozen", name: "Jumbo eggs (dozen)", category: "eggs", price: 10, compareAt: 11, cost: 4, stock: 15,
    description: "Our largest eggs, 800g+ per dozen. Great for baking.", freshness: "Collected daily", fulfilment: "PICKUP",
  },
  {
    slug: "duck-eggs-half-dozen", name: "Duck eggs (half dozen)", category: "eggs", price: 9, cost: 4.5, stock: 8,
    description: "Rich, creamy duck eggs. Bakers love them for sponges and custards.", fulfilment: "PICKUP",
    preOrderEligible: true,
  },
  {
    slug: "quail-eggs-dozen", name: "Quail eggs (dozen)", category: "eggs", price: 7, cost: 3, stock: 10,
    description: "Tiny speckled quail eggs — a treat soft-boiled or pickled.", fulfilment: "BOTH",
  },
  {
    slug: "egg-tray-30", name: "Egg tray (30 eggs)", category: "eggs", price: 18, compareAt: 20, cost: 8, stock: 12,
    description: "A full tray of 30 free-range eggs for big families and cafes.", fulfilment: "PICKUP",
    preOrderEligible: true,
  },
  {
    slug: "lemon-curd", name: "Lemon curd", category: "pantry-and-bakes", price: 9.5, cost: 3.5, stock: 20,
    description: "Silky lemon curd made with our eggs and backyard lemons. 250g jar.", fulfilment: "BOTH",
    options: { name: "Size", choices: [{ name: "250g jar", delta: 0 }, { name: "400g jar", delta: 4 }] },
  },
  {
    slug: "egg-pasta", name: "Fresh egg pasta", category: "pantry-and-bakes", price: 12, cost: 4, stock: 10,
    description: "Hand-rolled fresh pasta made with our free-range yolks. 500g.", freshness: "Made Friday",
    fulfilment: "PICKUP", options: { name: "Cut", choices: [{ name: "Tagliatelle", delta: 0 }, { name: "Pappardelle", delta: 0 }] },
  },
  {
    slug: "vanilla-sponge", name: "Vanilla sponge cake", category: "pantry-and-bakes", price: 24, cost: 8, stock: 4,
    description: "A light double-layer vanilla sponge with jam and cream. Serves 8.", fulfilment: "PICKUP",
    preOrderEligible: true,
  },
  {
    slug: "custard-tarts-4", name: "Custard tarts (4 pack)", category: "pantry-and-bakes", price: 14, cost: 5, stock: 6,
    description: "Four baked egg custard tarts with nutmeg on a buttery shortcrust.", freshness: "Baked this morning",
    fulfilment: "BOTH",
  },
];
