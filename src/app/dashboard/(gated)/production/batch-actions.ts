"use server";

import { requireOwnerWrite } from "@/lib/session";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import { prisma } from "@/lib/prisma";
import { costRecipe, ingredientCostPerBase } from "@/lib/production/batch-costing";
import { loadCostContext } from "@/lib/production/load-cost-context";
import { nextBatchCode } from "@/lib/production/batch-code";
import { recordBatchStock } from "@/lib/production/batch-stock";
import {
  dateOnly,
  decimal,
  failure,
  optionalText,
  text,
  wholeNumber,
  type ActionResult,
} from "@/lib/production/form-parse";
import { afterProductionChange } from "./after-production-change";

export async function createBatch(formData: FormData): Promise<ActionResult> {
  try {
    const { owner } = await requireOwnerWrite();
    const { selected } = await resolveSelectedBusiness(owner.id);
    if (!selected) return { error: "Create a business first." };
    const recipeId = text(formData, "recipeId");
    const batchCount = decimal(formData, "batchCount", true);
    const productId = text(formData, "productId") || null;
    const unitsMade = productId ? wholeNumber(formData, "unitsMade") : 0;
    if (batchCount == null) return { error: "Enter how many batches you made." };
    if (unitsMade == null) return { error: "Enter the number of sellable units made." };

    const ctx = await loadCostContext(owner.id);
    const recipe = ctx.recipes.get(recipeId);
    if (!recipe) return { error: "Choose a recipe." };
    const cost = costRecipe(recipeId, ctx, batchCount);
    const loop = cost.problems.find((p) => p.includes("contains itself"));
    if (loop) return { error: loop };

    const product = productId
      ? await prisma.product.findFirst({
          where: { id: productId, ownerId: owner.id, standId: selected.id, memberId: null },
          select: { id: true, packagingCostCents: true },
        })
      : null;
    if (productId && !product) return { error: "Product not found in this business." };

    const batchCode = optionalText(formData, "batchCode") ?? (await nextBatchCode(owner.id));
    const clash = await prisma.productionBatch.findUnique({
      where: { ownerId_batchCode: { ownerId: owner.id, batchCode } },
      select: { id: true },
    });
    if (clash) return { error: `Batch code ${batchCode} is already used.` };

    const totalCostCents = Math.round(cost.totalCents);
    const unitCostCents = unitsMade > 0 ? Math.round(totalCostCents / unitsMade) : null;
    const lines = [...cost.requirements].map(([ingredientId, quantity]) => {
      const ingredient = ctx.ingredients.get(ingredientId);
      const perBase = ingredient ? ingredientCostPerBase(ingredient) : null;
      return {
        ingredientId,
        ingredientName: ingredient?.name ?? "Unknown",
        quantity,
        unit: ingredient?.baseUnit ?? "EACH",
        costCents: Math.round(quantity * (perBase ?? 0)),
      };
    });

    await prisma.$transaction(async (tx) => {
      await tx.productionBatch.create({
        data: {
          ownerId: owner.id,
          standId: selected.id,
          recipeId,
          recipeName: recipe.name,
          productId: product?.id ?? null,
          batchCode,
          batchCount,
          unitsMade,
          madeAt: dateOnly(formData, "madeAt") ?? new Date(),
          bestBefore: dateOnly(formData, "bestBefore"),
          materialCostCents: Math.round(cost.materialCents),
          labourCostCents: Math.round(cost.labourCents),
          overheadCostCents: Math.round(cost.overheadCents),
          totalCostCents,
          unitCostCents,
          notes: optionalText(formData, "notes"),
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
          ownerId: owner.id,
          standId: selected.id,
          change: unitsMade,
          reason: `Production batch ${batchCode}`,
          costCents:
            formData.get("updateCost") === "on" && unitCostCents != null
              ? unitCostCents + (product.packagingCostCents ?? 0)
              : undefined,
        });
      }
    });

    await afterProductionChange(owner.id, product && unitsMade > 0 ? product.id : null);
    return { ok: true, message: `Batch ${batchCode} recorded.` };
  } catch (error) {
    return failure("createBatch failed", error);
  }
}
