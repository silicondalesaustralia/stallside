import type { ProductionResponse } from "@/contracts/mobile/production";
import { prisma } from "@/lib/prisma";
import { toDateInputValue } from "@/lib/date-range";
import { loadBatchFormData } from "@/lib/production/batch-form-data";

const BATCH_LIMIT = 30;

/** Recipes, products and recent batches for the app's Batches screen. */
export async function loadProductionResponse(
  ownerId: string,
  stand: { id: string; timezone: string },
): Promise<ProductionResponse> {
  const [data, row] = await Promise.all([
    loadBatchFormData(ownerId, stand.id, BATCH_LIMIT),
    prisma.stand.findUnique({ where: { id: stand.id }, select: { currency: true } }),
  ]);
  return {
    currency: row?.currency ?? "AUD",
    today: toDateInputValue(new Date(), stand.timezone),
    recipes: data.recipes,
    products: data.products,
    lowMaterials: data.lowMaterials,
    batches: data.batches.map((b) => ({
      id: b.id,
      batchCode: b.batchCode,
      madeOn: b.madeAt.toISOString().slice(0, 10),
      bestBefore: b.bestBefore ? b.bestBefore.toISOString().slice(0, 10) : null,
      recipeName: b.recipeName,
      productName: b.productName,
      batchCount: b.batchCount,
      unitsMade: b.unitsMade,
      totalCostCents: b.totalCostCents,
      unitCostCents: b.unitCostCents,
      notes: b.notes,
    })),
  };
}
