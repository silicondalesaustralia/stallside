import { z } from "zod";

export const PRODUCT_TABS = ["standard", "preorder", "draft", "supplier"] as const;
export const productTab = z.enum(PRODUCT_TABS);
export type ProductTab = z.infer<typeof productTab>;

export const productsQuery = z.object({
  standId: z.string().min(1),
  tab: productTab.default("standard"),
  q: z.string().trim().max(100).optional(),
});
export type ProductsQuery = z.infer<typeof productsQuery>;

export const mobileProduct = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string().nullable(),
  priceCents: z.number().int(),
  currency: z.string(),
  stockQuantity: z.number().int(),
  lowStockThreshold: z.number().int(),
  isArchived: z.boolean(),
  supplierName: z.string().nullable(),
});
export type MobileProduct = z.infer<typeof mobileProduct>;

export const productsResponse = z.object({ products: z.array(mobileProduct) });
export type ProductsResponse = z.infer<typeof productsResponse>;

export const stockUpdateBody = z.object({
  quantity: z.number().int().min(0).max(1_000_000),
});
export type StockUpdateBody = z.infer<typeof stockUpdateBody>;

export const stockUpdateResponse = z.object({
  productId: z.string(),
  stockQuantity: z.number().int(),
});
export type StockUpdateResponse = z.infer<typeof stockUpdateResponse>;
