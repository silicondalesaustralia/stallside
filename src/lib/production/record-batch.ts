import { prisma } from "@/lib/prisma";
import { costRecipe, ingredientCostPerBase } from "./batch-costing";
import { loadCostContext } from "./load-cost-context";
import { nextBatchCode } from "./batch-code";
import { recordBatchStock } from "./batch-stock";
import { packagingUses } from "./packaging";
import { afterProductionChange } from "./after-production-change";
import type { ActionResult } from "./form-parse";

export type RecordBatchInput = {
  recipeId: string;
  /** Batches made; may be fractional (half a batch). */
  batchCount: number;
  productId: string | null;
  /** Sellable units made; ignored without a product. */
  unitsMade: number;
  batchCode: string | null;
  madeAt: Date | null;
  bestBefore: Date | null;
  notes: string | null;
  /** Set the product's unit cost from this batch. */
  updateCost: boolean;
};

/**
 * Records a production run: takes the recipe's materials (and the product's packaging) out of
 * stock, adds the finished units to the product, and saves what the batch cost.
 */
export async function recordOwnerBatch(ownerId: string, standId: string, input: RecordBatchInput): Promise<ActionResult> {
  if (!(input.batchCount > 0)) return { error: "Enter how many batches you made." };
  const unitsMade = input.productId ? input.unitsMade : 0;
  if (!Number.isInteger(unitsMade) || unitsMade < 0) return { error: "Enter the number of sellable units made." };

  const ctx = await loadCostContext(ownerId);
  const recipe = ctx.recipes.get(input.recipeId);
  if (!recipe) return { error: "Choose a recipe." };
  const cost = costRecipe(input.recipeId, ctx, input.batchCount);
  const loop = cost.problems.find((p) => p.includes("contains itself"));
  if (loop) return { error: loop };

  const product = input.productId
    ? await prisma.product.findFirst({
        where: { id: input.productId, ownerId, standId, memberId: null },
        select: {
          id: true,
          packagingCostCents: true,
          packagingLines: { select: { id: true, ingredientId: true, quantity: true, unit: true } },
        },
      })
    : null;
  if (input.productId && !product) return { error: "Product not found in this business." };

  const batchCode = input.batchCode ?? (await nextBatchCode(ownerId));
  const clash = await prisma.productionBatch.findUnique({
    where: { ownerId_batchCode: { ownerId, batchCode } },
    select: { id: true },
  });
  if (clash) return { error: `Batch code ${batchCode} is already used.` };

  const packaging = packagingUses(
    (product?.packagingLines ?? []).map((p) => ({ ...p, quantity: Number(p.quantity) })),
    ctx.ingredients,
    unitsMade,
  );
  const packagingCostCents = Math.round(packaging.reduce((sum, p) => sum + p.costCents, 0));
  const totalCostCents = Math.round(cost.totalCents) + packagingCostCents;
  const unitCostCents = unitsMade > 0 ? Math.round(totalCostCents / unitsMade) : null;
  const lines = [
    ...[...cost.requirements].map(([ingredientId, quantity]) => {
      const ingredient = ctx.ingredients.get(ingredientId);
      const perBase = ingredient ? ingredientCostPerBase(ingredient) : null;
      return {
        ingredientId,
        ingredientName: ingredient?.name ?? "Unknown",
        quantity,
        unit: ingredient?.baseUnit ?? "EACH",
        costCents: Math.round(quantity * (perBase ?? 0)),
        isPackaging: false,
      };
    }),
    ...packaging.map((p) => ({
      ingredientId: p.ingredientId,
      ingredientName: p.name,
      quantity: p.quantity,
      unit: p.unit,
      costCents: Math.round(p.costCents),
      isPackaging: true,
    })),
  ];

  await prisma.$transaction(async (tx) => {
    await tx.productionBatch.create({
      data: {
        ownerId,
        standId,
        recipeId: input.recipeId,
        recipeName: recipe.name,
        productId: product?.id ?? null,
        batchCode,
        batchCount: input.batchCount,
        unitsMade,
        madeAt: input.madeAt ?? new Date(),
        bestBefore: input.bestBefore,
        materialCostCents: Math.round(cost.materialCents),
        labourCostCents: Math.round(cost.labourCents),
        overheadCostCents: Math.round(cost.overheadCents),
        packagingCostCents,
        totalCostCents,
        unitCostCents,
        notes: input.notes,
        lines: { create: lines },
      },
    });
    for (const line of lines) {
      await tx.ingredient.update({
        where: { id: line.ingredientId },
        data: { onHandQuantity: { decrement: line.quantity } },
      });
    }
    if (product && unitsMade > 0) {
      await recordBatchStock(tx, {
        productId: product.id,
        ownerId,
        standId,
        change: unitsMade,
        reason: `Production batch ${batchCode}`,
        costCents:
          input.updateCost && unitCostCents != null ? unitCostCents + (product.packagingCostCents ?? 0) : undefined,
      });
    }
  });

  await afterProductionChange(ownerId, product && unitsMade > 0 ? product.id : null);
  return { ok: true, message: `Batch ${batchCode} recorded.` };
}
