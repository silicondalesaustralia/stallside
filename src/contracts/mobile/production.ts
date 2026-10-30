import { z } from "zod";

export const productionQuery = z.object({ standId: z.string().min(1) });

export const batchRecipeOption = z.object({
  id: z.string(),
  name: z.string(),
  yieldQuantity: z.number(),
  yieldLabel: z.string(),
  /** Cost of one batch (materials, labour, overhead) before packaging. */
  batchCostCents: z.number(),
  /** Product this recipe is linked to in this business, if any. */
  productId: z.string().nullable(),
  /** Recipe yield units per sellable product unit (e.g. 12 cookies per box). */
  yieldUnitsPerProduct: z.number().nullable(),
});
export type BatchRecipeOptionDto = z.infer<typeof batchRecipeOption>;

export const productionBatch = z.object({
  id: z.string(),
  batchCode: z.string(),
  /** YYYY-MM-DD. */
  madeOn: z.string(),
  bestBefore: z.string().nullable(),
  recipeName: z.string(),
  productName: z.string().nullable(),
  batchCount: z.number(),
  unitsMade: z.number().int(),
  totalCostCents: z.number().int(),
  unitCostCents: z.number().int().nullable(),
  notes: z.string().nullable(),
});
export type ProductionBatchDto = z.infer<typeof productionBatch>;

export const productionResponse = z.object({
  currency: z.string(),
  /** Today in the business's time zone, YYYY-MM-DD. */
  today: z.string(),
  recipes: z.array(batchRecipeOption),
  products: z.array(z.object({ id: z.string(), name: z.string() })),
  /** Materials at or below their reorder level. */
  lowMaterials: z.array(z.string()),
  batches: z.array(productionBatch),
});
export type ProductionResponse = z.infer<typeof productionResponse>;

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.");

export const recordBatchBody = z.object({
  standId: z.string().min(1),
  recipeId: z.string().min(1),
  batchCount: z.number().positive(),
  productId: z.string().min(1).nullable(),
  unitsMade: z.number().int().min(0),
  batchCode: z.string().trim().max(60).nullable(),
  madeOn: day.nullable(),
  bestBefore: day.nullable(),
  notes: z.string().trim().max(1000).nullable(),
  updateCost: z.boolean(),
});
export type RecordBatchBody = z.infer<typeof recordBatchBody>;

export const productionMessage = z.object({ message: z.string() });
export type ProductionMessage = z.infer<typeof productionMessage>;
