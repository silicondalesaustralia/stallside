import type { ProductionResponse } from "@/contracts/mobile/production";
import { loadBatchFormData } from "@/lib/production/batch-form-data";
import { loadStandLocale } from "./stand-locale";

const BATCH_LIMIT = 30;

/** Recipes, products and recent batches for the app's Batches screen. */
export async function loadProductionResponse(
  ownerId: string,
  stand: { id: string; timezone: string },
): Promise<ProductionResponse> {
  const [data, locale] = await Promise.all([
    loadBatchFormData(ownerId, stand.id, BATCH_LIMIT),
    loadStandLocale(stand),
  ]);
  return {
    ...locale,
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
