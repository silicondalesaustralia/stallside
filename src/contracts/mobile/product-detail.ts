import { z } from "zod";

export const PRODUCT_STATUSES = ["live", "hidden", "draft"] as const;
export const productStatus = z.enum(PRODUCT_STATUSES);
export type ProductStatus = z.infer<typeof productStatus>;

export const mobileProductDetail = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  standName: z.string(),
  status: productStatus,
  priceCents: z.number().int(),
  compareAtPriceCents: z.number().int().nullable(),
  costCents: z.number().int().nullable(),
  currency: z.string(),
  stockQuantity: z.number().int(),
  lowStockThreshold: z.number().int(),
  sku: z.string().nullable(),
  upc: z.string().nullable(),
  isPreOrder: z.boolean(),
  hasOptions: z.boolean(),
  hasVolumePrices: z.boolean(),
  supplierName: z.string().nullable(),
  webPath: z.string(),
});
export type MobileProductDetail = z.infer<typeof mobileProductDetail>;

export const productPriceBody = z.object({
  priceCents: z.number().int().min(0).max(100_000_000),
  compareAtPriceCents: z.number().int().min(0).max(100_000_000).nullable(),
});
export type ProductPriceBody = z.infer<typeof productPriceBody>;

export const PRODUCT_STATUS_ACTIONS = ["hide", "show", "archive", "restore"] as const;
export const productStatusBody = z.object({ action: z.enum(PRODUCT_STATUS_ACTIONS) });
export type ProductStatusBody = z.infer<typeof productStatusBody>;
