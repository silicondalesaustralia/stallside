import { z } from "zod";
import { WEBSITE_AI_SPEC_VERSION } from "./types";
import type { WebsitePageType } from "./types";

const PAGE_TYPES = [
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
] as const;

const SECTION_TYPES = [
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
] as const;

const pageTypeSchema = z.enum(PAGE_TYPES);
const sectionTypeSchema = z.enum(SECTION_TYPES);

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
      .record(
        z.string(),
        z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
      )
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

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

export function coerceDesignSystem(value: unknown): "artisan" | "farmhouse" | "market" {
  if (value === "artisan" || value === "farmhouse" || value === "market") return value;
  const text = JSON.stringify(value ?? "").toLowerCase();
  if (/premium|handcraft|artisan|bakery|sourdough/.test(text)) return "artisan";
  if (/bold|energetic|market|vibrant/.test(text)) return "market";
  return "farmhouse";
}

export function coercePageType(value: unknown, href?: unknown): WebsitePageType | null {
  const fromHref = typeof href === "string" ? href.toLowerCase() : "";
  if (fromHref === "/" || fromHref === "/home") return "HOME";
  if (fromHref.includes("about")) return "ABOUT";
  if (fromHref.includes("contact")) return "CONTACT";
  if (fromHref.includes("faq")) return "FAQ";
  if (fromHref.includes("shop") || fromHref.includes("product")) return "SHOP";
  if (fromHref.includes("farm") || fromHref.includes("stand")) return "FARM_STAND";
  if (fromHref.includes("menu") || fromHref.includes("preorder")) return "MENU";
  if (fromHref.includes("event")) return "EVENTS";
  if (fromHref.includes("review")) return "REVIEWS";
  if (fromHref.includes("blog")) return "BLOG";
  if (fromHref.includes("subscription")) return "SUBSCRIPTIONS";
  if (fromHref.includes("privacy")) return "PRIVACY";
  if (fromHref.includes("term")) return "TERMS";
  if (fromHref.includes("refund")) return "REFUNDS";
  if (fromHref.includes("delivery")) return "DELIVERY_POLICY";

  const raw = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  if ((PAGE_TYPES as readonly string[]).includes(raw)) return raw as WebsitePageType;
  const aliases: Record<string, WebsitePageType> = {
    HOME_PAGE: "HOME",
    INDEX: "HOME",
    LANDING: "HOME",
    FARMSTAND: "FARM_STAND",
    FARM_STAND_PAGE: "FARM_STAND",
    STAND: "FARM_STAND",
    STORE: "SHOP",
    PRODUCTS: "SHOP",
    PREORDERS: "MENU",
    WEEKLY_MENU: "MENU",
    MENUS: "MENU",
    SUBSCRIBE: "SUBSCRIPTIONS",
  };
  return aliases[raw] ?? null;
}

function coerceSectionType(value: unknown): (typeof SECTION_TYPES)[number] {
  const raw = String(value ?? "").trim();
  if ((SECTION_TYPES as readonly string[]).includes(raw)) {
    return raw as (typeof SECTION_TYPES)[number];
  }
  const lower = raw.toLowerCase();
  if (lower.includes("hero")) return "Hero";
  if (lower.includes("product")) return "ProductGrid";
  if (lower.includes("categor")) return "CategoryGrid";
  if (lower.includes("menu") || lower.includes("drop")) return "NextDrop";
  if (lower.includes("farm") || lower.includes("stand")) return "FarmStand";
  if (lower.includes("review")) return "Reviews";
  if (lower.includes("pickup") || lower.includes("deliver")) return "Pickup";
  if (lower.includes("signup") || lower.includes("newsletter")) return "Signup";
  if (lower.includes("about") || lower.includes("story")) return "ImageText";
  if (lower.includes("image")) return "Image";
  return "Text";
}

function normalizeNavigation(value: unknown): { label: string; pageType: WebsitePageType }[] {
  let items: unknown[] = [];
  if (Array.isArray(value)) items = value;
  else if (isPlainObject(value)) {
    if (Array.isArray(value.items)) items = value.items;
    else if (Array.isArray(value.links)) items = value.links;
  }

  const out: { label: string; pageType: WebsitePageType }[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    if (!isPlainObject(item)) continue;
    const pageType = coercePageType(item.pageType ?? item.type ?? item.id, item.href ?? item.url);
    if (!pageType) continue;
    if (seen.has(pageType)) continue;
    seen.add(pageType);
    const label =
      typeof item.label === "string" && item.label.trim()
        ? item.label.trim().slice(0, 40)
        : pageType.replaceAll("_", " ");
    out.push({ label, pageType });
  }
  if (!out.some((n) => n.pageType === "HOME")) {
    out.unshift({ label: "Home", pageType: "HOME" });
  }
  // Keep primary commerce/nav pages; drop policy links if over the limit.
  const primary = new Set([
    "HOME",
    "SHOP",
    "FARM_STAND",
    "MENU",
    "ABOUT",
    "CONTACT",
    "FAQ",
    "BLOG",
    "REVIEWS",
    "EVENTS",
    "SUBSCRIPTIONS",
  ]);
  const preferred = out.filter((n) => primary.has(n.pageType));
  const rest = out.filter((n) => !primary.has(n.pageType));
  return [...preferred, ...rest].slice(0, 12);
}

function normalizeSiteStrategy(value: unknown): {
  primaryGoal: string;
  audienceSummary: string;
  contentPriorities: string[];
} {
  if (!isPlainObject(value)) {
    return {
      primaryGoal: "shop",
      audienceSummary: "Local customers",
      contentPriorities: [],
    };
  }
  return {
    primaryGoal:
      typeof value.primaryGoal === "string" && value.primaryGoal
        ? value.primaryGoal.slice(0, 200)
        : "shop",
    audienceSummary:
      typeof value.audienceSummary === "string" && value.audienceSummary
        ? value.audienceSummary.slice(0, 400)
        : "Local customers",
    contentPriorities: Array.isArray(value.contentPriorities)
      ? value.contentPriorities.filter((x): x is string => typeof x === "string").slice(0, 12)
      : [],
  };
}

const siteStrategySchema = z.object({
  primaryGoal: z.string().max(200),
  audienceSummary: z.string().max(400),
  contentPriorities: z.array(z.string().max(100)).max(12),
});

export const aiSitePlanSchema = z.object({
  version: z.literal(WEBSITE_AI_SPEC_VERSION),
  designSystem: z.enum(["artisan", "farmhouse", "market"]),
  siteStrategy: siteStrategySchema,
  navigation: z
    .array(
      z.object({
        label: z.string().max(40),
        pageType: pageTypeSchema,
      }),
    )
    .max(12),
  pages: z
    .array(
      z.object({
        pageType: pageTypeSchema,
        title: z.string().max(80),
        slug: nullToUndefined(z.string().max(80).optional()),
        sections: z.array(sectionSchema).max(12),
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

/** Coerce free-form Astra JSON into WebsiteAISpecV1 before Zod. */
export function normalizeAiPlanRaw(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const obj = raw as Record<string, unknown>;

  const nested =
    (isPlainObject(obj.plan) ? obj.plan : null) ??
    (isPlainObject(obj.sitePlan) ? obj.sitePlan : null) ??
    (isPlainObject(obj.website) ? obj.website : null) ??
    obj;

  const plan = { ...nested };

  plan.version = WEBSITE_AI_SPEC_VERSION;
  plan.designSystem = coerceDesignSystem(plan.designSystem);
  plan.siteStrategy = normalizeSiteStrategy(plan.siteStrategy);
  plan.navigation = normalizeNavigation(plan.navigation);

  let pagesIn: unknown[] = [];
  if (Array.isArray(plan.pages)) pagesIn = plan.pages;
  else if (isPlainObject(plan.pages)) pagesIn = Object.values(plan.pages);

  const normalizedPages: Array<{
    pageType: string;
    title: string;
    slug?: string;
    sections: Record<string, unknown>[];
    seo?: Record<string, unknown>;
  }> = pagesIn.map((page, i) => {
    if (!isPlainObject(page)) {
      return { pageType: "HOME", title: "Home", sections: [] };
    }
    const pageType =
      coercePageType(page.pageType ?? page.type, page.slug ?? page.href) ?? "CUSTOM_INFO";
    const sectionsIn = Array.isArray(page.sections) ? page.sections : [];
    const sections: Record<string, unknown>[] = sectionsIn.map((section, j) => {
      if (!isPlainObject(section)) {
        return { id: `sec-${j}`, type: "Text", body: "" };
      }
      const s: Record<string, unknown> = { ...section };
      s.id = typeof s.id === "string" && s.id ? String(s.id).slice(0, 64) : `sec-${j}`;
      s.type = coerceSectionType(s.type);
      if (isPlainObject(s.props)) {
        const cleaned: Record<string, string | number | boolean | string[]> = {};
        for (const [k, v] of Object.entries(s.props)) {
          if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
            cleaned[k] = v;
          } else if (Array.isArray(v) && v.every((x) => typeof x === "string")) {
            cleaned[k] = v;
          }
        }
        s.props = cleaned;
      } else if (s.props === null) {
        delete s.props;
      }
      for (const key of Object.keys(s)) {
        if (s[key] === null) delete s[key];
      }
      return s;
    });

    return {
      pageType,
      title:
        typeof page.title === "string" && page.title
          ? page.title.slice(0, 80)
          : pageType.replaceAll("_", " "),
      slug: typeof page.slug === "string" ? page.slug.slice(0, 80) : undefined,
      sections,
      seo: isPlainObject(page.seo) ? page.seo : undefined,
    };
  });

  if (!normalizedPages.some((p) => p.pageType === "HOME")) {
    normalizedPages.unshift({
      pageType: "HOME",
      title: "Home",
      sections: [{ id: "hero-0", type: "Hero", headline: "Welcome" }],
    });
  }
  plan.pages = normalizedPages;

  if (plan.missingInformation === null) delete plan.missingInformation;
  if (plan.changeSummary === null) delete plan.changeSummary;
  if (typeof plan.changeSummary !== "string") delete plan.changeSummary;

  return plan;
}

export function formatPlanSchemaError(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "invalid";
  const path = issue.path.length ? issue.path.join(".") : "(root)";
  return `${path}: ${issue.message}`;
}
