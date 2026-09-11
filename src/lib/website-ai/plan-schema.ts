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

const nullToUndefined = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === null ? undefined : v), schema);

const sectionSchema = z.object({
  id: z.string().min(1).max(64),
  type: sectionTypeSchema,
  preset: nullToUndefined(z.string().max(64).optional()),
  heading: nullToUndefined(z.string().max(120).optional()),
  body: nullToUndefined(z.string().max(2000).optional()),
  headline: nullToUndefined(z.string().max(120).optional()),
  subheadline: nullToUndefined(z.string().max(300).optional()),
  ctaLabel: nullToUndefined(z.string().max(60).optional()),
  dataSource: nullToUndefined(
    z
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
  ),
  props: nullToUndefined(
    z
      .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]))
      .optional(),
  ),
  copyKind: nullToUndefined(z.enum(["INSTRUCTIONAL", "GENERIC", "SELLER"]).optional()),
  placeholderKind: nullToUndefined(
    z
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
  ),
  visibility: nullToUndefined(z.enum(["ALL", "EDITOR_ONLY"]).optional()),
  productPresentation: nullToUndefined(z.enum(["LIVE", "SAMPLE"]).optional()),
});

const siteStrategySchema = z.preprocess(
  (v) =>
    v && typeof v === "object"
      ? v
      : {
          primaryGoal: "shop",
          audienceSummary: "Local customers",
          contentPriorities: [],
        },
  z.object({
    primaryGoal: z.string().max(200).default("shop"),
    audienceSummary: z.string().max(400).default("Local customers"),
    contentPriorities: z.array(z.string().max(100)).max(12).default([]),
  }),
);

export const aiSitePlanSchema = z.object({
  version: z
    .literal(WEBSITE_AI_SPEC_VERSION)
    .or(z.number())
    .or(z.string())
    .transform(() => WEBSITE_AI_SPEC_VERSION)
    .catch(WEBSITE_AI_SPEC_VERSION),
  designSystem: z.enum(["artisan", "farmhouse", "market"]).catch("farmhouse"),
  siteStrategy: siteStrategySchema,
  navigation: z
    .array(
      z.object({
        label: z.string().max(40),
        pageType: pageTypeSchema,
      }),
    )
    .max(10)
    .default([]),
  pages: z
    .array(
      z.object({
        pageType: pageTypeSchema,
        title: z.string().max(80),
        slug: nullToUndefined(z.string().max(80).optional()),
        sections: z.array(sectionSchema).max(12).default([]),
        seo: nullToUndefined(
          z
            .object({
              title: nullToUndefined(z.string().max(70).optional()),
              description: nullToUndefined(z.string().max(160).optional()),
            })
            .optional(),
        ),
      }),
    )
    .min(1)
    .max(12),
  missingInformation: nullToUndefined(
    z
      .array(
        z.object({
          code: z.string().max(64),
          message: z.string().max(300),
          blocking: z.boolean(),
        }),
      )
      .optional(),
  ),
  changeSummary: nullToUndefined(z.string().max(800).optional()),
});

export type ParsedAiSitePlan = z.infer<typeof aiSitePlanSchema>;

/** Unwrap common Astra wrappers and drop nullish junk before Zod. */
export function normalizeAiPlanRaw(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const obj = raw as Record<string, unknown>;

  const nested =
    (obj.plan && typeof obj.plan === "object" ? obj.plan : null) ??
    (obj.sitePlan && typeof obj.sitePlan === "object" ? obj.sitePlan : null) ??
    (obj.website && typeof obj.website === "object" ? obj.website : null) ??
    obj;

  const plan = { ...(nested as Record<string, unknown>) };

  if (!plan.siteStrategy || typeof plan.siteStrategy !== "object") {
    plan.siteStrategy = {
      primaryGoal: "shop",
      audienceSummary: "Local customers",
      contentPriorities: [],
    };
  }
  if (!Array.isArray(plan.navigation)) plan.navigation = [];
  if (!Array.isArray(plan.pages)) plan.pages = [];

  plan.pages = (plan.pages as unknown[]).map((page, i) => {
    if (!page || typeof page !== "object") {
      return {
        pageType: "HOME",
        title: "Home",
        sections: [],
      };
    }
    const p = { ...(page as Record<string, unknown>) };
    if (!Array.isArray(p.sections)) p.sections = [];
    if (!p.title) p.title = typeof p.pageType === "string" ? p.pageType : `Page ${i + 1}`;
    p.sections = (p.sections as unknown[]).map((section, j) => {
      if (!section || typeof section !== "object") {
        return { id: `sec-${j}`, type: "Text", body: "" };
      }
      const s = { ...(section as Record<string, unknown>) };
      if (!s.id) s.id = `sec-${j}`;
      // Drop null optional fields so Zod optional() accepts them
      for (const key of Object.keys(s)) {
        if (s[key] === null) delete s[key];
      }
      return s;
    });
    if (p.seo === null) delete p.seo;
    return p;
  });

  if (plan.missingInformation === null) delete plan.missingInformation;
  if (plan.changeSummary === null) delete plan.changeSummary;

  return plan;
}

export function formatPlanSchemaError(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "invalid";
  const path = issue.path.length ? issue.path.join(".") : "(root)";
  return `${path}: ${issue.message}`;
}
