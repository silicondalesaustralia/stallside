import { z } from "zod";
import { materialUnit } from "./material-units";

export const recipesQuery = z.object({ standId: z.string().min(1) });

const productCost = z.object({
  productId: z.string(),
  name: z.string(),
  /** Recipe share plus packaging, in cents. */
  unitCostCents: z.number().int(),
  priceCents: z.number().int(),
  /** Profit as a % of price, before payment fees; null when there's no price. */
  marginPercent: z.number().nullable(),
  currency: z.string(),
});
export type RecipeProductCost = z.infer<typeof productCost>;

export const recipeSummary = z.object({
  id: z.string(),
  name: z.string(),
  yieldQuantity: z.number(),
  yieldLabel: z.string(),
  lineCount: z.number().int(),
  isActive: z.boolean(),
  /** Missing prices, unit mismatches or loops make the cost incomplete. */
  needsAttention: z.boolean(),
  batchCostCents: z.number().int(),
  unitCostCents: z.number().int(),
  products: z.array(productCost),
});
export type RecipeSummary = z.infer<typeof recipeSummary>;

export const recipesResponse = z.object({ currency: z.string(), recipes: z.array(recipeSummary) });
export type RecipesResponse = z.infer<typeof recipesResponse>;

export const recipeLine = z.object({
  id: z.string(),
  kind: z.enum(["material", "recipe"]),
  /** Sub-recipe id, so the app can open it. */
  recipeId: z.string().nullable(),
  name: z.string(),
  quantityLabel: z.string(),
  /** Material cost incl. waste; null for sub-recipes or missing prices. */
  costCents: z.number().int().nullable(),
});
export type RecipeLineDto = z.infer<typeof recipeLine>;

export const recipeSettings = z.object({
  name: z.string().trim().min(1).max(120),
  yieldQuantity: z.number().positive(),
  yieldLabel: z.string().trim().max(40),
  wastePercent: z.number().min(0).max(500),
  labourMinutes: z.number().int().min(0),
  labourRateCents: z.number().int().min(0),
  overheadCents: z.number().int().min(0),
  instructions: z.string().trim().max(5000).nullable(),
});
export type RecipeSettings = z.infer<typeof recipeSettings>;

export const recipeDetailResponse = z.object({
  currency: z.string(),
  recipe: recipeSettings.extend({ id: z.string(), isActive: z.boolean() }),
  cost: z.object({
    materialCents: z.number().int(),
    labourCents: z.number().int(),
    overheadCents: z.number().int(),
    totalCents: z.number().int(),
    unitCents: z.number().int(),
    problems: z.array(z.string()),
  }),
  lines: z.array(recipeLine),
  products: z.array(
    productCost.extend({
      yieldUnitsPerProduct: z.number(),
      packagingCents: z.number().int(),
      stockQuantity: z.number().int(),
    }),
  ),
  materials: z.array(z.object({ id: z.string(), name: z.string(), baseUnit: materialUnit })),
  subRecipes: z.array(z.object({ id: z.string(), name: z.string(), yieldLabel: z.string() })),
  /** This business's products not yet made from a recipe. */
  linkable: z.array(z.object({ id: z.string(), name: z.string() })),
});
export type RecipeDetailResponse = z.infer<typeof recipeDetailResponse>;

export const createRecipeBody = z.object({
  name: z.string().trim().min(1).max(120),
  yieldQuantity: z.number().positive(),
  yieldLabel: z.string().trim().max(40),
});
export type CreateRecipeBody = z.infer<typeof createRecipeBody>;

export const recipeActiveBody = z.object({ isActive: z.boolean() });

export const addRecipeLineBody = z.object({
  kind: z.enum(["material", "recipe"]),
  sourceId: z.string().min(1),
  quantity: z.number().positive(),
  /** Required for materials; must match the material's measure. */
  unit: materialUnit.nullable(),
});
export type AddRecipeLineBody = z.infer<typeof addRecipeLineBody>;

export const linkRecipeProductBody = z.object({
  productId: z.string().min(1),
  yieldUnitsPerProduct: z.number().positive(),
});
export type LinkRecipeProductBody = z.infer<typeof linkRecipeProductBody>;

export const recipeMessage = z.object({ message: z.string(), recipeId: z.string().optional() });
export type RecipeMessage = z.infer<typeof recipeMessage>;
