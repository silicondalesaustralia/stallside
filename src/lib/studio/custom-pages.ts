import type { SerializedNodes } from "@craftjs/core";

export const BLOG_INDEX_BUILTIN_ID = "builtin-blog";

export type CustomPageTemplateId =
  | "blank"
  | "about"
  | "contact"
  | "faq"
  | "wholesale"
  | "stockists"
  | "pickup-delivery"
  | "info"
  | "privacy"
  | "terms"
  | "returns"
  | "shipping-pickup"
  | "blog-index";

export type BuiltinPageKey =
  | "about"
  | "contact"
  | "privacy"
  | "terms"
  | "returns"
  | "shipping"
  | "blog";

export type CustomPageRouteKind = "builtin" | "custom";

export type FooterColumnId = "shop" | "visit" | "policies";

export const FOOTER_COLUMNS: {
  id: FooterColumnId;
  label: string;
}[] = [
  { id: "shop", label: "Shop" },
  { id: "visit", label: "Visit & Learn" },
  { id: "policies", label: "Policies" },
];

export type StorefrontCustomPage = {
  id: string;
  slug: string;
  title: string;
  navLabel: string;
  template: CustomPageTemplateId;
  enabled: boolean;
  showInNav: boolean;
  showInFooter: boolean;
  sortOrder: number;
  routeKind: CustomPageRouteKind;
  builtinKey?: BuiltinPageKey;
  /** Footer column when showInFooter is true. */
  footerColumn?: FooterColumnId;
};

export function isFooterColumnId(value: unknown): value is FooterColumnId {
  return value === "shop" || value === "visit" || value === "policies";
}

export function defaultFooterColumn(page: {
  slug: string;
  builtinKey?: BuiltinPageKey;
  template: CustomPageTemplateId;
}): FooterColumnId {
  if (
    page.builtinKey === "privacy" ||
    page.builtinKey === "terms" ||
    page.builtinKey === "returns" ||
    page.builtinKey === "shipping" ||
    page.template === "privacy" ||
    page.template === "terms" ||
    page.template === "returns" ||
    page.template === "shipping-pickup"
  ) {
    return "policies";
  }
  if (
    page.slug === "this-week" ||
    page.slug === "shop" ||
    page.slug.startsWith("category")
  ) {
    return "shop";
  }
  return "visit";
}

export function resolveFooterColumn(page: StorefrontCustomPage): FooterColumnId {
  return page.footerColumn && isFooterColumnId(page.footerColumn)
    ? page.footerColumn
    : defaultFooterColumn(page);
}

export const RESERVED_PAGE_SLUGS = new Set([
  "shop",
  "product",
  "menu",
  "pages",
  "about",
  "contact",
  "privacy",
  "terms",
  "returns",
  "shipping",
  "blog",
  "studio-preview",
  "craft-preview",
  "puck-preview",
  "cart",
  "checkout",
]);

export const CUSTOM_PAGE_TEMPLATES: {
  id: CustomPageTemplateId;
  label: string;
  description: string;
  category?: "content" | "policy";
}[] = [
  { id: "blank", label: "Blank", description: "Start with an empty page", category: "content" },
  { id: "about", label: "About", description: "Introduce your business with story sections", category: "content" },
  { id: "contact", label: "Contact", description: "Contact details and enquiry prompt", category: "content" },
  { id: "faq", label: "FAQ", description: "Common questions and answers", category: "content" },
  { id: "wholesale", label: "Wholesale", description: "Trade and wholesale enquiry page", category: "content" },
  { id: "stockists", label: "Stockists", description: "Where to find your products", category: "content" },
  { id: "pickup-delivery", label: "Pickup & delivery", description: "How customers get their order", category: "content" },
  { id: "info", label: "Information", description: "General information with text and images", category: "content" },
  { id: "privacy", label: "Privacy policy", description: "Editable privacy policy starter (not legal advice)", category: "policy" },
  { id: "terms", label: "Terms of service", description: "Editable terms starter (not legal advice)", category: "policy" },
  { id: "returns", label: "Returns & refunds", description: "Returns and refund policy starter", category: "policy" },
  { id: "shipping-pickup", label: "Shipping & pickup", description: "Shipping, pickup and delivery policy starter", category: "policy" },
  { id: "blog-index", label: "Blog index", description: "Intro sections above your blog post list", category: "content" },
];

export function slugifyPageSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function isValidPageSlug(slug: string): boolean {
  if (!slug || slug.length < 1) return false;
  if (RESERVED_PAGE_SLUGS.has(slug)) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function isCustomPage(raw: unknown): raw is StorefrontCustomPage {
  if (!raw || typeof raw !== "object") return false;
  const p = raw as Partial<StorefrontCustomPage>;
  if (
    !(
      typeof p.id === "string" &&
      typeof p.slug === "string" &&
      typeof p.title === "string" &&
      typeof p.navLabel === "string" &&
      typeof p.template === "string" &&
      typeof p.enabled === "boolean" &&
      typeof p.showInNav === "boolean" &&
      typeof p.showInFooter === "boolean" &&
      typeof p.sortOrder === "number" &&
      (p.routeKind === "builtin" || p.routeKind === "custom")
    )
  ) {
    return false;
  }
  if (p.footerColumn !== undefined && !isFooterColumnId(p.footerColumn)) {
    return false;
  }
  return true;
}

export function extractCustomPages(raw: unknown): StorefrontCustomPage[] {
  if (!raw || typeof raw !== "object") return [];
  const list = (raw as { customPages?: unknown }).customPages;
  if (!Array.isArray(list)) return [];
  return list.filter(isCustomPage).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function mergeCustomPagesIntoRaw(
  existingRaw: unknown,
  pages: StorefrontCustomPage[],
): Record<string, unknown> {
  const base =
    existingRaw && typeof existingRaw === "object" && !Array.isArray(existingRaw)
      ? { ...(existingRaw as Record<string, unknown>) }
      : {};
  return { ...base, customPages: pages };
}

export function findCustomPageBySlug(
  pages: StorefrontCustomPage[],
  slug: string,
): StorefrontCustomPage | undefined {
  const key = slug.trim().toLowerCase();
  return pages.find((p) => p.slug === key);
}

export function findCustomPageById(
  pages: StorefrontCustomPage[],
  id: string,
): StorefrontCustomPage | undefined {
  return pages.find((p) => p.id === id);
}

export function findCustomPageByBuiltinKey(
  pages: StorefrontCustomPage[],
  key: BuiltinPageKey,
): StorefrontCustomPage | undefined {
  return pages.find((p) => p.builtinKey === key);
}

function defaultPolicyPages(): StorefrontCustomPage[] {
  return [
    {
      id: "builtin-privacy",
      slug: "privacy",
      title: "Privacy policy",
      navLabel: "Privacy",
      template: "privacy",
      enabled: true,
      showInNav: false,
      showInFooter: true,
      sortOrder: 30,
      routeKind: "builtin",
      builtinKey: "privacy",
    },
    {
      id: "builtin-terms",
      slug: "terms",
      title: "Terms of service",
      navLabel: "Terms",
      template: "terms",
      enabled: true,
      showInNav: false,
      showInFooter: true,
      sortOrder: 40,
      routeKind: "builtin",
      builtinKey: "terms",
    },
    {
      id: "builtin-returns",
      slug: "returns",
      title: "Returns & refunds",
      navLabel: "Returns",
      template: "returns",
      enabled: true,
      showInNav: false,
      showInFooter: true,
      sortOrder: 50,
      routeKind: "builtin",
      builtinKey: "returns",
    },
    {
      id: "builtin-shipping",
      slug: "shipping",
      title: "Shipping & pickup",
      navLabel: "Shipping",
      template: "shipping-pickup",
      enabled: true,
      showInNav: false,
      showInFooter: true,
      sortOrder: 60,
      routeKind: "builtin",
      builtinKey: "shipping",
    },
  ];
}

export function defaultBuiltinPages(): StorefrontCustomPage[] {
  return [
    {
      id: "builtin-about",
      slug: "about",
      title: "About",
      navLabel: "About",
      template: "about",
      enabled: true,
      showInNav: true,
      showInFooter: true,
      sortOrder: 10,
      routeKind: "builtin",
      builtinKey: "about",
    },
    {
      id: "builtin-contact",
      slug: "contact",
      title: "Contact",
      navLabel: "Contact",
      template: "contact",
      enabled: true,
      showInNav: true,
      showInFooter: true,
      sortOrder: 20,
      routeKind: "builtin",
      builtinKey: "contact",
    },
    {
      id: BLOG_INDEX_BUILTIN_ID,
      slug: "blog",
      title: "Blog",
      navLabel: "Blog",
      template: "blog-index",
      enabled: true,
      showInNav: false,
      showInFooter: false,
      sortOrder: 15,
      routeKind: "builtin",
      builtinKey: "blog",
    },
    ...defaultPolicyPages(),
  ];
}

function mergeMissingBuiltinPages(
  existing: StorefrontCustomPage[],
  defaults: StorefrontCustomPage[],
): StorefrontCustomPage[] {
  if (existing.length === 0) return defaults;
  const result = [...existing];
  for (const d of defaults) {
    const has = existing.some(
      (p) =>
        p.builtinKey === d.builtinKey ||
        (d.routeKind === "builtin" && p.slug === d.slug && p.routeKind === "builtin"),
    );
    if (!has) result.push(d);
  }
  return result.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function ensureCustomPages(raw: unknown): StorefrontCustomPage[] {
  const existing = extractCustomPages(raw);
  return mergeMissingBuiltinPages(existing, defaultBuiltinPages());
}

export function customPagesNeedSync(raw: unknown): boolean {
  const existing = extractCustomPages(raw);
  const merged = ensureCustomPages(raw);
  if (merged.length !== existing.length) return true;
  return merged.some(
    (p) => p.builtinKey && !existing.some((e) => e.builtinKey === p.builtinKey),
  );
}

export type StudioPageNodesMap = Record<string, SerializedNodes>;

export const STUDIO_HOME_PAGE_KEY = "home";

export const BUILTIN_PAGE_KEYS: BuiltinPageKey[] = [
  "about",
  "contact",
  "privacy",
  "terms",
  "returns",
  "shipping",
  "blog",
];
