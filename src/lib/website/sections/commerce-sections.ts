import { z } from "zod";
import { WEBSITE_LIMITS as L } from "@/lib/website/schema/limits";
import { ALL_PAGE_KINDS, count, entityId, heading } from "./fields";
import type { SectionDefinition } from "./types";
import { CATEGORY_VARIANTS, NEXT_DROP_VARIANTS, PRODUCT_VARIANTS, DEFAULT_ONLY } from "./variants";

export const productGrid: SectionDefinition = {
  type: "productGrid",
  version: 1,
  craftName: "CraftProductGridSection",
  label: "Products",
  variantProp: "preset",
  variants: PRODUCT_VARIANTS,
  defaultVariant: "classic",
  content: z.object({ heading: heading.optional() }),
  settings: z.object({
    limit: count(1, L.productIdsPerSection).optional(),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    showPrice: z.boolean().optional(),
    showAvailability: z.boolean().optional(),
  }),
  binding: z.object({
    source: z.enum(["all", "category", "manual", "activeCategory"]).optional(),
    categoryId: z.string().max(L.idChars).optional(),
    productIds: z.array(entityId).max(L.productIdsPerSection).optional(),
  }),
  pageKinds: ALL_PAGE_KINDS,
  singleton: false,
  required: false,
  emptyState: "omit",
};

export const categories: SectionDefinition = {
  type: "categories",
  version: 1,
  craftName: "CraftCategoriesSection",
  label: "Categories",
  variantProp: "preset",
  legacyVariantProp: "layout",
  variants: CATEGORY_VARIANTS,
  defaultVariant: "tiles",
  content: z.object({ heading: heading.optional() }),
  settings: z.object({}),
  binding: z.object({
    source: z.enum(["all", "selected"]).optional(),
    categoryIds: z.array(entityId).max(L.productIdsPerSection).optional(),
  }),
  pageKinds: ALL_PAGE_KINDS,
  singleton: true,
  required: false,
  emptyState: "omit",
};

export const nextDrop: SectionDefinition = {
  type: "nextDrop",
  version: 1,
  craftName: "CraftNextDropSection",
  label: "Next drop",
  variantProp: "preset",
  variants: NEXT_DROP_VARIANTS,
  defaultVariant: "card",
  content: z.object({ heading: heading.optional() }),
  settings: z.object({
    maxItems: count(1, 12).optional(),
    showClosingDate: z.boolean().optional(),
    showPickupDate: z.boolean().optional(),
  }),
  pageKinds: ["home", "content", "shop", "category"],
  businessModes: ["FOOD_BUSINESS", "BOTH"],
  singleton: true,
  required: false,
  emptyState: "omit",
};

export const productDetail: SectionDefinition = {
  type: "productDetail",
  version: 1,
  craftName: "CraftProductDetailSection",
  label: "Product detail",
  variants: DEFAULT_ONLY,
  defaultVariant: "default",
  content: z.object({}),
  settings: z.object({
    showBackLink: z.boolean().optional(),
    showReviews: z.boolean().optional(),
  }),
  pageKinds: ["product"],
  singleton: true,
  required: true,
  emptyState: "render",
};

export const menuDetail: SectionDefinition = {
  type: "menuDetail",
  version: 1,
  craftName: "CraftMenuDetailSection",
  label: "Menu detail",
  variants: DEFAULT_ONLY,
  defaultVariant: "default",
  content: z.object({}),
  settings: z.object({}),
  pageKinds: ["menu"],
  singleton: true,
  required: true,
  emptyState: "render",
};
