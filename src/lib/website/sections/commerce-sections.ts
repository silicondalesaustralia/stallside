import { z } from "zod";
import { WEBSITE_LIMITS as L } from "@/lib/website/schema/limits";
import { ALL_PAGE_KINDS, count, entityId, heading, shortText } from "./fields";
import type { SectionDefinition } from "./types";
import {
  PRODUCT_IMAGE_RATIOS,
  PRODUCT_IMAGE_SIDES,
  IMAGE_SIZE_MAX,
  IMAGE_SIZE_MIN,
  PRODUCT_LAYOUTS,
  infoRowsSchema,
  productTabsSchema,
} from "@/lib/studio/product-detail-settings";
import { blockLayoutSchema } from "@/lib/studio/product-blocks-schema";
import { BUTTON_WIDTH_MAX, BUTTON_WIDTH_MIN, PRODUCT_BUTTONS } from "@/lib/studio/product-buttons";
import { CATEGORY_ALIGNS } from "@/lib/studio/category-detail-settings";
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
    columns: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
    /** Where a 1-column list sits. */
    align: z.enum(["left", "centre"]).optional(),
    showPrice: z.boolean().optional(),
    showAvailability: z.boolean().optional(),
    showRatings: z.boolean().optional(),
    showCategoryIntro: z.boolean().optional(),
    cardBackground: z.enum(["white", "none"]).optional(),
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
  content: z.object({ heading: heading.optional(), intro: shortText.optional() }),
  settings: z.object({
    showDescriptions: z.boolean().optional(),
    showRatings: z.boolean().optional(),
    cardBackground: z.enum(["white", "none"]).optional(),
  }),
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
  content: z.object({
    infoRows: infoRowsSchema.optional(),
    tabs: productTabsSchema.optional(),
  }),
  settings: z.object({
    showBackLink: z.boolean().optional(),
    showBreadcrumbs: z.boolean().optional(),
    showReviews: z.boolean().optional(),
    showReviewForm: z.boolean().optional(),
    showRating: z.boolean().optional(),
    layout: z.enum(PRODUCT_LAYOUTS).optional(),
    imageRatio: z.enum(PRODUCT_IMAGE_RATIOS).optional(),
    imageSide: z.enum(PRODUCT_IMAGE_SIDES).optional(),
    imageSize: z.number().int().min(IMAGE_SIZE_MIN).max(IMAGE_SIZE_MAX).optional(),
    blockLayout: blockLayoutSchema.optional(),
    enlarge: z.boolean().optional(),
    stickyCart: z.boolean().optional(),
    buttons: z.enum(PRODUCT_BUTTONS).optional(),
    buttonWidth: z.number().int().min(BUTTON_WIDTH_MIN).max(BUTTON_WIDTH_MAX).optional(),
    showPayments: z.boolean().optional(),
  }),
  pageKinds: ["product"],
  singleton: true,
  required: true,
  emptyState: "render",
};

export const categoryDetail: SectionDefinition = {
  type: "categoryDetail",
  version: 1,
  craftName: "CraftCategoryDetailSection",
  label: "Category page",
  variantProp: "preset",
  variants: PRODUCT_VARIANTS,
  defaultVariant: "classic",
  content: z.object({}),
  settings: z.object({
    showTitle: z.boolean().optional(),
    showTopDescription: z.boolean().optional(),
    showBottomDescription: z.boolean().optional(),
    align: z.enum(CATEGORY_ALIGNS).optional(),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    mobileColumns: z.union([z.literal(1), z.literal(2)]).optional(),
    showPrice: z.boolean().optional(),
    showAvailability: z.boolean().optional(),
    showRatings: z.boolean().optional(),
    cardBackground: z.enum(["white", "none"]).optional(),
  }),
  pageKinds: ["category"],
  singleton: true,
  required: false,
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

export const cart: SectionDefinition = {
  type: "cart",
  version: 1,
  craftName: "CraftCartSection",
  label: "Cart & checkout",
  variants: DEFAULT_ONLY,
  defaultVariant: "default",
  content: z.object({}),
  settings: z.object({}),
  pageKinds: ["cart"],
  singleton: true,
  required: true,
  emptyState: "render",
};

export const preOrder: SectionDefinition = {
  type: "preOrder",
  version: 1,
  craftName: "CraftPreOrderSection",
  label: "Pre-order page",
  variants: DEFAULT_ONLY,
  defaultVariant: "default",
  content: z.object({}),
  settings: z.object({}),
  pageKinds: ["preorder"],
  singleton: true,
  required: true,
  emptyState: "render",
};

export const preOrderList: SectionDefinition = {
  type: "preOrderList",
  version: 1,
  craftName: "CraftPreOrderListSection",
  label: "Pre-orders category",
  variants: DEFAULT_ONLY,
  defaultVariant: "default",
  content: z.object({}),
  settings: z.object({}),
  pageKinds: ["preorders"],
  singleton: true,
  required: true,
  emptyState: "render",
};

export const subscriptionList: SectionDefinition = {
  type: "subscriptionList",
  version: 1,
  craftName: "CraftSubscriptionListSection",
  label: "Subscriptions & memberships category",
  variants: DEFAULT_ONLY,
  defaultVariant: "default",
  content: z.object({}),
  settings: z.object({}),
  pageKinds: ["subscriptions"],
  singleton: true,
  required: true,
  emptyState: "render",
};

export const subscription: SectionDefinition = {
  type: "subscription",
  version: 1,
  craftName: "CraftSubscriptionSection",
  label: "Subscription & membership",
  variants: DEFAULT_ONLY,
  defaultVariant: "default",
  content: z.object({}),
  settings: z.object({}),
  pageKinds: ["subscription"],
  singleton: true,
  required: true,
  emptyState: "render",
};

export const orderConfirmation: SectionDefinition = {
  type: "orderConfirmation",
  version: 1,
  craftName: "CraftOrderConfirmationSection",
  label: "Order confirmation",
  variants: DEFAULT_ONLY,
  defaultVariant: "default",
  content: z.object({}),
  settings: z.object({ showRestock: z.boolean().optional() }),
  pageKinds: ["success"],
  singleton: true,
  required: true,
  emptyState: "render",
};
