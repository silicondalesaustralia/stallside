import { z } from "zod";

export const mobileCategory = z.object({
  id: z.string(),
  title: z.string(),
  isActive: z.boolean(),
  showOnWebsite: z.boolean(),
  productCount: z.number().int(),
});
export type MobileCategory = z.infer<typeof mobileCategory>;

export const categoriesResponse = z.object({ categories: z.array(mobileCategory) });
export type CategoriesResponse = z.infer<typeof categoriesResponse>;

export const mobileCategoryProduct = z.object({
  id: z.string(),
  name: z.string(),
  /** "SKU 12 · Green Valley", or null. */
  detail: z.string().nullable(),
  imageUrl: z.string().nullable(),
  isHidden: z.boolean(),
});
export type MobileCategoryProduct = z.infer<typeof mobileCategoryProduct>;

export const categoryDetailResponse = z.object({
  category: mobileCategory,
  /** Products in this category, in shop order. */
  products: z.array(mobileCategoryProduct),
  /** Every product that could be added, for the picker. */
  allProducts: z.array(mobileCategoryProduct),
  webPath: z.string(),
});
export type CategoryDetailResponse = z.infer<typeof categoryDetailResponse>;

const ids = z.array(z.string().min(1)).max(2000);

export const createCategoryBody = z.object({ title: z.string().trim().min(1).max(80) });
export const categoryIdResponse = z.object({ id: z.string() });
export type CategoryIdResponse = z.infer<typeof categoryIdResponse>;
export const categoryOrderBody = z.object({ order: ids });
export const updateCategoryBody = z.object({
  title: z.string().trim().min(1).max(80).optional(),
  showOnWebsite: z.boolean().optional(),
  isActive: z.boolean().optional(),
});
export type UpdateCategoryBody = z.infer<typeof updateCategoryBody>;
export const categoryProductsBody = z.object({ productIds: ids });
