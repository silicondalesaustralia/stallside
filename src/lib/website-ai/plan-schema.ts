import { z } from "zod";
import { WEBSITE_AI_SPEC_VERSION } from "./types";

const pageTypeSchema = z.enum([
  "HOME",
  "ABOUT",
  "CONTACT",
  "FAQ",
  "SHOP",
  "CATEGORY",
  "PRODUCT",
  "MENU",
  "SUBSCRIPTIONS",
  "FARM_STAND",
  "EVENTS",
  "REVIEWS",
  "BLOG_INDEX",
  "BLOG_POST",
  "BLOG",
  "CUSTOM_INFO",
  "PRIVACY",
  "TERMS",
  "SHIPPING_PICKUP",
  "REFUNDS",
  "DELIVERY_POLICY",
]);

const sectionTypeSchema = z.enum([
  "Hero",
  "ProductGrid",
  "CategoryGrid",
  "NextDrop",
  "FarmStand",
  "ImageText",
  "About",
  "Reviews",
  "Pickup",
  "Signup",
  "Text",
  "Image",
]);

const sectionSchema = z.object({
  id: z.string().min(1).max(64),
  type: sectionTypeSchema,
  preset: z.string().max(64).optional(),
  heading: z.string().max(120).optional(),
  body: z.string().max(2000).optional(),
  headline: z.string().max(120).optional(),
  subheadline: z.string().max(300).optional(),
  ctaLabel: z.string().max(60).optional(),
  dataSource: z
    .enum([
      "FEATURED_PRODUCTS",
      "LATEST_PRODUCTS",
      "CATEGORY",
      "CURRENT_MENU",
      "NEXT_DROP",
      "NEXT_AVAILABLE_PICKUP",
      "PRIMARY_STAND",
      "PICKUP_LOCATIONS",
      "DELIVERY_ZONES",
      "TOP_REVIEWS",
      "ACTIVE_SUBSCRIPTIONS",
      "SUBSCRIPTION_PLANS",
      "ORDER_FORM",
      "PICKUP_OPTIONS",
      "UPCOMING_EVENTS",
      "SIGNUP_DESTINATION",
      "LATEST_BLOG_POSTS",
    ])
    .optional(),
  props: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]))
    .optional(),
  copyKind: z.enum(["INSTRUCTIONAL", "GENERIC", "SELLER"]).optional(),
  placeholderKind: z
    .enum([
      "COPY_INSTRUCTIONAL",
      "COPY_GENERIC",
      "IMAGE_DECORATIVE",
      "LOGO_MARK",
      "SAMPLE_PRODUCTS",
      "SETUP_STUB",
      "POLICY_VARIABLE",
    ])
    .optional(),
  visibility: z.enum(["ALL", "EDITOR_ONLY"]).optional(),
  productPresentation: z.enum(["LIVE", "SAMPLE"]).optional(),
});

export const aiSitePlanSchema = z.object({
  version: z.literal(WEBSITE_AI_SPEC_VERSION).or(z.number()).transform(() => WEBSITE_AI_SPEC_VERSION),
  designSystem: z.enum(["artisan", "farmhouse", "market"]),
  siteStrategy: z.object({
    primaryGoal: z.string().max(200),
    audienceSummary: z.string().max(400),
    contentPriorities: z.array(z.string().max(100)).max(12),
  }),
  navigation: z
    .array(
      z.object({
        label: z.string().max(40),
        pageType: pageTypeSchema,
      }),
    )
    .max(10),
  pages: z
    .array(
      z.object({
        pageType: pageTypeSchema,
        title: z.string().max(80),
        slug: z.string().max(80).optional(),
        sections: z.array(sectionSchema).max(12),
        seo: z
          .object({
            title: z.string().max(70).optional(),
            description: z.string().max(160).optional(),
          })
          .optional(),
      }),
    )
    .min(1)
    .max(12),
  missingInformation: z
    .array(
      z.object({
        code: z.string().max(64),
        message: z.string().max(300),
        blocking: z.boolean(),
      }),
    )
    .optional(),
  changeSummary: z.string().max(800).optional(),
});

export type ParsedAiSitePlan = z.infer<typeof aiSitePlanSchema>;
