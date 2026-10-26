import { costRecipe, ingredientCostPerBase, type CostContext } from "../../../src/lib/production/batch-costing";
import { convertQuantity } from "../../../src/lib/production/unit-convert";
import { BATCH_PREFIX, MARK, at, weekStart, type Db, type Scope } from "./context";
import { MATERIALS, type MaterialKey, type MaterialRef } from "./materials";
import type { RecipeIds } from "./recipes";
import type { Catalogue } from "./catalogue";

export const WEEKS = 6;

async function loadContext(db: Db, ownerId: string): Promise<CostContext> {
  const [ingredients, recipes] = await Promise.all([
    db.ingredient.findMany({ where: { ownerId } }),
    db.recipe.findMany({ where: { ownerId }, include: { lines: true } }),
  ]);
  return {
    ingredients: new Map(ingredients.map((i) => [i.id, {
      id: i.id, name: i.name, baseUnit: i.baseUnit, purchaseQuantity: Number(i.purchaseQuantity),
      purchaseUnit: i.purchaseUnit, purchasePriceCents: i.purchasePriceCents,
    }])),
    recipes: new Map(recipes.map((r) => [r.id, {
      id: r.id, name: r.name, yieldQuantity: Number(r.yieldQuantity), wastePercent: Number(r.wastePercent),
      labourMinutes: r.labourMinutes, labourRateCents: r.labourRateCents, overheadCents: r.overheadCents,
      lines: r.lines.map((l) => ({
        id: l.id, ingredientId: l.ingredientId, componentRecipeId: l.componentRecipeId,
        quantity: Number(l.quantity), unit: l.unit,
      })),
    }])),
  };
}

async function purchase(db: Db, ref: MaterialRef, key: MaterialKey, cents: number, when: Date, invoice: string) {
  const m = MATERIALS[key];
  const inBase = convertQuantity(m.packQty, m.packUnit, m.baseUnit) ?? 0;
  await db.$transaction([
    db.ingredientPurchase.create({
      data: { ingredientId: ref.id, quantity: m.packQty, unit: m.packUnit, totalCents: cents, supplier: m.supplier, invoiceNumber: invoice, receivedAt: when, createdAt: when },
    }),
    db.ingredient.update({
      where: { id: ref.id },
      data: { onHandQuantity: { increment: inBase }, purchaseQuantity: m.packQty, purchaseUnit: m.packUnit, purchasePriceCents: cents },
    }),
    db.ingredientCostHistory.create({
      data: { ingredientId: ref.id, purchaseQuantity: m.packQty, purchaseUnit: m.packUnit, purchasePriceCents: cents, note: "Purchase", recordedAt: when },
    }),
  ]);
}

async function batch(db: Db, scope: Scope, recipeId: string, productId: string, units: number, packaging: number, when: Date, code: string) {
  const ctx = await loadContext(db, scope.ownerId);
  const recipe = ctx.recipes.get(recipeId);
  if (!recipe) throw new Error("recipe missing");
  const cost = costRecipe(recipeId, ctx, 1);
  const total = Math.round(cost.totalCents);
  const lines = [...cost.requirements].map(([ingredientId, quantity]) => {
    const ing = ctx.ingredients.get(ingredientId);
    const perBase = ing ? ingredientCostPerBase(ing) : null;
    return { ingredientId, ingredientName: ing?.name ?? "Unknown", quantity, unit: ing?.baseUnit ?? "EACH", costCents: Math.round(quantity * (perBase ?? 0)) };
  });
  const unitCost = Math.round(total / units);
  await db.$transaction(async (tx) => {
    await tx.productionBatch.create({
      data: {
        ownerId: scope.ownerId, standId: scope.standId, recipeId, recipeName: recipe.name, productId,
        batchCode: code, batchCount: 1, unitsMade: units, madeAt: when, createdAt: when,
        bestBefore: new Date(when.getTime() + 3 * 86400000),
        materialCostCents: Math.round(cost.materialCents), labourCostCents: Math.round(cost.labourCents),
        overheadCostCents: Math.round(cost.overheadCents), totalCostCents: total, unitCostCents: unitCost,
        lines: { create: lines },
      },
    });
    for (const l of lines) {
      await tx.ingredient.update({ where: { id: l.ingredientId }, data: { onHandQuantity: { decrement: l.quantity } } });
    }
    const p = await tx.product.findUniqueOrThrow({ where: { id: productId }, select: { stockQuantity: true } });
    await tx.product.update({ where: { id: productId }, data: { stockQuantity: p.stockQuantity + units, costCents: unitCost + packaging } });
    await tx.inventoryAdjustment.create({
      data: {
        productId, ownerId: scope.ownerId, standId: scope.standId, changeQuantity: units,
        previousQuantity: p.stockQuantity, newQuantity: p.stockQuantity + units,
        reason: `Production batch ${code} ${MARK}`, source: "PRODUCTION", createdAt: when,
      },
    });
  });
}

/** Six weeks of Monday deliveries, then focaccia Wed–Fri (3 × 10) and cookies Thu–Fri (2 × 6 bags). */
export async function seedProduction(db: Db, scope: Scope, materials: Record<MaterialKey, MaterialRef>, recipes: RecipeIds, cat: Catalogue) {
  let batches = 0;
  for (let w = 0; w < WEEKS; w++) {
    const monday = weekStart(WEEKS - w);
    for (const [key, m] of Object.entries(MATERIALS) as [MaterialKey, (typeof MATERIALS)[MaterialKey]][]) {
      const buy = m.buys.find((b) => (Array.isArray(b) ? b[0] : b) === w);
      if (buy === undefined) continue;
      const cents = Array.isArray(buy) ? buy[1] : m.packCents;
      await purchase(db, materials[key], key, cents, at(monday, 0, 8, 30), `INV-${1040 + w}`);
    }
    for (const day of [2, 3, 4]) {
      const code = `${BATCH_PREFIX}F${w + 1}${day}`;
      await batch(db, scope, recipes.focaccia, cat.focaccia.id, 10, 0, at(monday, day, 5, 30), code);
      batches++;
    }
    for (const day of [3, 4]) {
      const code = `${BATCH_PREFIX}C${w + 1}${day}`;
      await batch(db, scope, recipes.cookies, cat.cookies.id, 6, 0, at(monday, day, 7, 0), code);
      batches++;
    }
  }
  console.log(`Production: ${batches} batches over ${WEEKS} weeks`);
}
