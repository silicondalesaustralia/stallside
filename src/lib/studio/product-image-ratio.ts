export const PRODUCT_IMAGE_RATIOS = ["square", "portrait", "landscape"] as const;
export type ProductImageRatio = (typeof PRODUCT_IMAGE_RATIOS)[number];

export const RATIO_CLASS: Record<ProductImageRatio, string> = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  landscape: "aspect-[4/3]",
};
