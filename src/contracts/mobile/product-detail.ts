import { z } from "zod";

export const PRODUCT_STATUSES = ["live", "hidden", "draft"] as const;
export const productStatus = z.enum(PRODUCT_STATUSES);
export type ProductStatus = z.infer<typeof productStatus>;

export const mobileProductVariant = z.object({
  id: z.string(),
  /** e.g. "Large / Red". */
  label: z.string(),
  sku: z.string().nullable(),
  priceCents: z.number().int(),
  stockQuantity: z.number().int(),
  isActive: z.boolean(),
});
export type MobileProductVariant = z.infer<typeof mobileProductVariant>;

export const mobileProductDetail = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  /** All photos in shop order; the first is the main photo. */
  photos: z.array(z.string()),
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
  /** When not empty, stock and price live on each variant; the product shows their totals. */
  variants: z.array(mobileProductVariant),
  webPath: z.string(),
});
export type MobileProductDetail = z.infer<typeof mobileProductDetail>;

export const productPriceBody = z.object({
  priceCents: z.number().int().min(0).max(100_000_000),
  compareAtPriceCents: z.number().int().min(0).max(100_000_000).nullable(),
});
export type ProductPriceBody = z.infer<typeof productPriceBody>;

export const PRODUCT_PHOTOS_LIMIT = 8;
/** Largest photo the app may send; the server shrinks it before saving. */
export const PRODUCT_PHOTO_UPLOAD_MAX_BYTES = 4 * 1024 * 1024;
export const productPhotoOrderBody = z.object({ order: z.array(z.string().url()).max(PRODUCT_PHOTOS_LIMIT) });
export const productPhotoQuery = z.object({ url: z.string().url() });

export const PRODUCT_STATUS_ACTIONS = ["hide", "show", "archive", "restore"] as const;
export const productStatusBody = z.object({ action: z.enum(PRODUCT_STATUS_ACTIONS) });
export type ProductStatusBody = z.infer<typeof productStatusBody>;
