import type { MeasureUnit } from "../../../src/generated/prisma/client";
import { MARK, type Db, type Scope } from "./context";

export type MaterialKey =
  | "breadFlour" | "oliveOil" | "salt" | "yeast" | "rosemary" | "saltFlakes" | "breadBags"
  | "plainFlour" | "butter" | "brownSugar" | "casterSugar" | "eggs" | "chocChips" | "vanilla"
  | "bicarb" | "cookieBags";

type MaterialDef = {
  name: string;
  baseUnit: MeasureUnit;
  packQty: number;
  packUnit: MeasureUnit;
  packCents: number;
  supplier: string;
  reorderLevel?: number;
  packaging?: true;
  /** Week indexes (0 = oldest) with a purchase; `[week, cents]` overrides the price. */
  buys: (number | [number, number])[];
};

const WHOLESALER = "Valley Wholesale Foods";
const MARKET = "Saturday Farmers Market";

export const MATERIALS: Record<MaterialKey, MaterialDef> = {
  breadFlour: { name: "Bread flour", baseUnit: "G", packQty: 12.5, packUnit: "KG", packCents: 2200, supplier: WHOLESALER, reorderLevel: 10000, buys: [0, 1, 2, [3, 2450], [4, 2450], [5, 2450]] },
  oliveOil: { name: "Extra virgin olive oil", baseUnit: "ML", packQty: 4, packUnit: "L", packCents: 3600, supplier: WHOLESALER, reorderLevel: 1000, buys: [0, 3] },
  salt: { name: "Fine salt", baseUnit: "G", packQty: 1, packUnit: "KG", packCents: 200, supplier: WHOLESALER, buys: [0, 3] },
  yeast: { name: "Instant yeast", baseUnit: "G", packQty: 500, packUnit: "G", packCents: 900, supplier: WHOLESALER, buys: [0, 3] },
  rosemary: { name: "Fresh rosemary", baseUnit: "G", packQty: 200, packUnit: "G", packCents: 700, supplier: MARKET, reorderLevel: 300, buys: [0, 1, 2, 3, 4, 5] },
  saltFlakes: { name: "Sea salt flakes", baseUnit: "G", packQty: 250, packUnit: "G", packCents: 600, supplier: WHOLESALER, buys: [0, 1, 3, 5] },
  breadBags: { name: "Bread bags", baseUnit: "EACH", packQty: 100, packUnit: "EACH", packCents: 1500, supplier: "PackRight Supplies", reorderLevel: 40, packaging: true, buys: [0, 3] },
  plainFlour: { name: "Plain flour", baseUnit: "G", packQty: 5, packUnit: "KG", packCents: 800, supplier: WHOLESALER, buys: [0, 3] },
  butter: { name: "Butter", baseUnit: "G", packQty: 2, packUnit: "KG", packCents: 2600, supplier: WHOLESALER, reorderLevel: 1000, buys: [0, 1, 2, 3, 4, 5] },
  brownSugar: { name: "Brown sugar", baseUnit: "G", packQty: 2, packUnit: "KG", packCents: 700, supplier: WHOLESALER, buys: [0, 2, 4] },
  casterSugar: { name: "Caster sugar", baseUnit: "G", packQty: 2, packUnit: "KG", packCents: 400, supplier: WHOLESALER, buys: [0, 3] },
  eggs: { name: "Eggs", baseUnit: "EACH", packQty: 30, packUnit: "EACH", packCents: 1200, supplier: "Green Valley Eggs", buys: [0, 3] },
  chocChips: { name: "Chocolate chips", baseUnit: "G", packQty: 2, packUnit: "KG", packCents: 2800, supplier: WHOLESALER, buys: [0, 1, 3, 5] },
  vanilla: { name: "Vanilla extract", baseUnit: "ML", packQty: 100, packUnit: "ML", packCents: 900, supplier: WHOLESALER, reorderLevel: 30, buys: [0] },
  bicarb: { name: "Bicarb soda", baseUnit: "G", packQty: 500, packUnit: "G", packCents: 300, supplier: WHOLESALER, buys: [0] },
  cookieBags: { name: "Cookie bags", baseUnit: "EACH", packQty: 100, packUnit: "EACH", packCents: 1200, supplier: "PackRight Supplies", reorderLevel: 30, packaging: true, buys: [0] },
};

export type MaterialRef = { id: string; name: string; baseUnit: MeasureUnit; supplier: string | null };

/** Creates each material with no stock; purchases add it week by week. */
export async function seedMaterials(db: Db, { ownerId }: Scope): Promise<Record<MaterialKey, MaterialRef>> {
  const refs = {} as Record<MaterialKey, MaterialRef>;
  for (const [key, m] of Object.entries(MATERIALS) as [MaterialKey, MaterialDef][]) {
    const row = await db.ingredient.create({
      data: {
        ownerId,
        name: m.name,
        baseUnit: m.baseUnit,
        purchaseQuantity: m.packQty,
        purchaseUnit: m.packUnit,
        purchasePriceCents: m.packCents,
        supplier: m.supplier,
        reorderLevel: m.reorderLevel ?? null,
        kind: m.packaging ? "PACKAGING" : "INGREDIENT",
        notes: MARK,
      },
      select: { id: true, name: true, baseUnit: true, supplier: true },
    });
    refs[key] = row;
  }
  return refs;
}
