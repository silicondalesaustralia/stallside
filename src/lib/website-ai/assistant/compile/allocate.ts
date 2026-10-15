import {
  isValidPageSlug,
  slugifyPageSlug,
  type CustomPageTemplateId,
  type StorefrontCustomPage,
} from "@/lib/studio/custom-pages";
import type { PolicyPageId } from "../brief/schema";
import type { NormalizedPage } from "../plan/normalize";

export const ASSISTANT_PAGE_PREFIX = "ai-";

const BUILTIN_IDS: Record<string, string> = {
  ABOUT: "builtin-about",
  CONTACT: "builtin-contact",
  BLOG: "builtin-blog",
};
const POLICY_IDS: Record<PolicyPageId, string> = {
  PRIVACY: "builtin-privacy",
  TERMS: "builtin-terms",
  REFUNDS: "builtin-returns",
  SHIPPING: "builtin-shipping",
};
const TEMPLATES: Record<string, CustomPageTemplateId> = {
  faq: "faq",
  visit: "pickup-delivery",
  reviews: "info",
  custom: "info",
};

export type Allocation = { key: string; pageId: string; slug: string };

/** Stable page record ID for a planned page; "home" for the homepage layout. */
export function pageIdFor(page: NormalizedPage): string {
  const { key, kind, policy } = page.target;
  if (kind === "home") return "home";
  if (policy) return POLICY_IDS[policy];
  if (BUILTIN_IDS[key]) return BUILTIN_IDS[key];
  if (key === "FAQ") return "ai-faq";
  return `${ASSISTANT_PAGE_PREFIX}${key.replace(/^custom:/, "page-").toLowerCase().replace(/[^a-z0-9-]/g, "-")}`.slice(0, 64);
}

function uniqueSlug(wanted: string, taken: Set<string>): string {
  const base = isValidPageSlug(wanted) ? wanted : `${wanted || "page"}-info`;
  let slug = isValidPageSlug(base) ? base : "info";
  for (let n = 2; taken.has(slug) || !isValidPageSlug(slug); n += 1) slug = `${base}-${n}`.slice(0, 64);
  taken.add(slug);
  return slug;
}

/**
 * Creates or updates page records for every planned page. Reuses existing records by stable ID,
 * resolves slug collisions against every existing page (enabled or not), never overwrites an
 * unrelated page that merely shares a title.
 */
export function allocatePages(
  existing: StorefrontCustomPage[],
  planned: NormalizedPage[],
): { pages: StorefrontCustomPage[]; allocations: Allocation[] } {
  const byId = new Map(existing.map((p) => [p.id, p]));
  const taken = new Set(existing.map((p) => p.slug));
  const allocations: Allocation[] = [];
  let sort = 100;
  for (const page of planned) {
    const pageId = pageIdFor(page);
    if (pageId === "home") {
      allocations.push({ key: page.target.key, pageId, slug: "" });
      continue;
    }
    const isPolicy = page.target.kind === "policy";
    const current = byId.get(pageId);
    const slug = current?.slug ?? uniqueSlug(slugifyPageSlug(page.title), taken);
    const record: StorefrontCustomPage = {
      ...(current ?? {
        id: pageId,
        slug,
        template: TEMPLATES[page.target.kind] ?? "info",
        routeKind: "custom" as const,
        sortOrder: sort,
      }),
      title: isPolicy && current ? current.title : page.title,
      navLabel: isPolicy && current ? current.navLabel : page.navLabel,
      enabled: true,
      showInNav: !isPolicy && page.target.kind !== "blog",
      showInFooter: true,
      footerColumn: isPolicy ? "policies" : "visit",
    };
    sort += 10;
    byId.set(pageId, record);
    allocations.push({ key: page.target.key, pageId, slug: record.slug });
  }
  const touched = new Set(allocations.map((a) => a.pageId));
  const pages = [...byId.values()].map((p) => {
    if (touched.has(p.id)) return p;
    const isPolicyPage = Object.values(POLICY_IDS).includes(p.id);
    return isPolicyPage ? p : { ...p, enabled: false, showInNav: false };
  });
  return { pages: pages.sort((a, b) => a.sortOrder - b.sortOrder), allocations };
}
