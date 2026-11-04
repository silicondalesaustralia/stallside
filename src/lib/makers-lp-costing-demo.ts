import type { CostIngredient } from "@/lib/production/batch-costing";
import type { Unit } from "@/lib/production/unit-convert";

/** Bakes mirror scripts/seed/green-valley-baked; the soap is a home-page-only example. */

const material = (
  id: string,
  name: string,
  baseUnit: Unit,
  purchaseQuantity: number,
  purchaseUnit: Unit,
  purchasePriceCents: number,
): CostIngredient => ({ id, name, baseUnit, purchaseQuantity, purchaseUnit, purchasePriceCents });

export const HOME_COSTING_MATERIALS: CostIngredient[] = [
  material("breadFlour", "Bread flour", "G", 12.5, "KG", 2200),
  material("oliveOil", "Extra virgin olive oil", "ML", 4, "L", 3600),
  material("salt", "Fine salt", "G", 1, "KG", 200),
  material("yeast", "Instant yeast", "G", 500, "G", 900),
  material("rosemary", "Fresh rosemary", "G", 200, "G", 700),
  material("saltFlakes", "Sea salt flakes", "G", 250, "G", 600),
  material("breadBags", "Bread bags", "EACH", 100, "EACH", 1500),
  material("plainFlour", "Plain flour", "G", 5, "KG", 800),
  material("butter", "Butter", "G", 2, "KG", 2600),
  material("brownSugar", "Brown sugar", "G", 2, "KG", 700),
  material("casterSugar", "Caster sugar", "G", 2, "KG", 400),
  material("eggs", "Eggs", "EACH", 30, "EACH", 1200),
  material("chocChips", "Chocolate chips", "G", 2, "KG", 2800),
  material("vanilla", "Vanilla extract", "ML", 100, "ML", 900),
  material("bicarb", "Bicarb soda", "G", 500, "G", 300),
  material("cookieBags", "Cookie bags", "EACH", 100, "EACH", 1200),
  material("coconutOil", "Coconut oil", "G", 3, "KG", 3000),
  material("sheaButter", "Shea butter", "G", 1, "KG", 2500),
  material("goatsMilk", "Goat’s milk", "ML", 1, "L", 400),
  material("lye", "Sodium hydroxide (lye)", "G", 1, "KG", 1500),
  material("honey", "Raw honey", "G", 1, "KG", 1400),
  material("soapWraps", "Soap wraps & labels", "EACH", 100, "EACH", 2000),
];

export type MakersLpCostingLine = { id: string; ingredientId: string; quantity: number; unit: Unit };

export type MakersLpCostingRecipe = {
  yieldQuantity: number;
  wastePercent: number;
  labourMinutes: number;
  labourRateCents: number;
  overheadCents: number;
  lines: MakersLpCostingLine[];
};

export type MakersLpCostingProduct = {
  id: "focaccia" | "cookies" | "soap";
  name: string;
  priceCents: number;
  yieldLabel: string;
  unitsPerProduct: number;
  packagingId: string;
  recipe: MakersLpCostingRecipe;
};

const lines = (rows: [string, number, Unit][]): MakersLpCostingLine[] =>
  rows.map(([ingredientId, quantity, unit]) => ({ id: ingredientId, ingredientId, quantity, unit }));

export const HOME_COSTING_PRODUCTS: MakersLpCostingProduct[] = [
  {
    id: "focaccia",
    name: "Rosemary & Sea Salt Focaccia",
    priceCents: 1050,
    yieldLabel: "loaves",
    unitsPerProduct: 1,
    packagingId: "breadBags",
    recipe: {
      yieldQuantity: 10,
      wastePercent: 5,
      labourMinutes: 60,
      labourRateCents: 3000,
      overheadCents: 400,
      lines: lines([
        ["breadFlour", 3, "KG"],
        ["oliveOil", 300, "ML"],
        ["salt", 60, "G"],
        ["yeast", 30, "G"],
        ["rosemary", 50, "G"],
        ["saltFlakes", 40, "G"],
      ]),
    },
  },
  {
    id: "cookies",
    name: "6 Choc Chip Cookies",
    priceCents: 1200,
    yieldLabel: "cookies",
    unitsPerProduct: 6,
    packagingId: "cookieBags",
    recipe: {
      yieldQuantity: 36,
      wastePercent: 3,
      labourMinutes: 45,
      labourRateCents: 3000,
      overheadCents: 300,
      lines: lines([
        ["plainFlour", 750, "G"],
        ["butter", 500, "G"],
        ["brownSugar", 400, "G"],
        ["casterSugar", 200, "G"],
        ["eggs", 3, "EACH"],
        ["chocChips", 500, "G"],
        ["vanilla", 10, "ML"],
        ["bicarb", 10, "G"],
        ["salt", 5, "G"],
      ]),
    },
  },
  {
    id: "soap",
    name: "Goat’s Milk & Honey Soap",
    priceCents: 900,
    yieldLabel: "bars",
    unitsPerProduct: 1,
    packagingId: "soapWraps",
    recipe: {
      yieldQuantity: 12,
      wastePercent: 2,
      labourMinutes: 40,
      labourRateCents: 3000,
      overheadCents: 200,
      lines: lines([
        ["oliveOil", 450, "ML"],
        ["coconutOil", 300, "G"],
        ["sheaButter", 150, "G"],
        ["goatsMilk", 300, "ML"],
        ["lye", 125, "G"],
        ["honey", 30, "G"],
      ]),
    },
  },
];
