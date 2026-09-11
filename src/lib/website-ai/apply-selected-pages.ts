import {
  ensureCustomPages,
  mergeCustomPagesIntoRaw,
  type StorefrontCustomPage,
} from "@/lib/studio/custom-pages";
import {
  ensureBlogSettings,
  mergeBlogSettingsIntoRaw,
  type StorefrontBlogSettings,
} from "@/lib/studio/blog";
import { parseStorefrontConfig } from "@/lib/storefront/config";
import type { StorefrontConfig } from "@/lib/storefront/types";

const FAQ_PAGE_ID = "ai-faq";

const PAGE_TO_BUILTIN: Record<string, string> = {
  ABOUT: "about",
  CONTACT: "contact",
  BLOG: "blog",
  PRIVACY: "privacy",
  TERMS: "terms",
  REFUNDS: "returns",
  DELIVERY_POLICY: "shipping",
};

const POLICY_KEYS = new Set(["privacy", "terms", "returns", "shipping"]);

function ensureFaqPage(pages: StorefrontCustomPage[]): StorefrontCustomPage[] {
  if (pages.some((p) => p.id === FAQ_PAGE_ID || p.slug === "faq")) return pages;
  return [
    ...pages,
    {
      id: FAQ_PAGE_ID,
      slug: "faq",
      title: "FAQ",
      navLabel: "FAQ",
      template: "faq",
      enabled: false,
      showInNav: false,
      showInFooter: true,
      sortOrder: 25,
      routeKind: "custom",
      footerColumn: "visit",
    },
  ];
}

/** Enable / place pages from AI site-shape selections onto the draft config. */
export function applySelectedPagesToDraft(
  draftRaw: unknown,
  selectedPages: string[],
  selectedCapabilities: string[] = [],
): Record<string, unknown> {
  const selected = new Set(selectedPages);
  let pages = ensureFaqPage(ensureCustomPages(draftRaw));

  pages = pages.map((page) => {
    const key = page.builtinKey;
    if (key === "about") {
      const on = selected.has("ABOUT");
      return { ...page, enabled: on, showInNav: on, showInFooter: on };
    }
    if (key === "contact") {
      const on = selected.has("CONTACT");
      return { ...page, enabled: on, showInNav: on, showInFooter: on };
    }
    if (key === "blog") {
      const on = selected.has("BLOG");
      // Header blog link comes from blogSettings; keep builtin page enabled for the route.
      return { ...page, enabled: on, showInNav: false, showInFooter: false };
    }
    if (key && POLICY_KEYS.has(key)) {
      const pageType = Object.entries(PAGE_TO_BUILTIN).find(([, v]) => v === key)?.[0];
      const on = pageType ? selected.has(pageType) : page.enabled;
      return {
        ...page,
        enabled: on,
        showInNav: on,
        showInFooter: on,
        footerColumn: "policies" as const,
      };
    }
    if (page.id === FAQ_PAGE_ID || page.slug === "faq") {
      const on = selected.has("FAQ");
      return { ...page, enabled: on, showInNav: on, showInFooter: on };
    }
    return page;
  });

  let raw = mergeCustomPagesIntoRaw(draftRaw, pages);

  const blogOn = selected.has("BLOG");
  const blog: StorefrontBlogSettings = {
    ...ensureBlogSettings(raw),
    enabled: blogOn || ensureBlogSettings(raw).enabled,
    showInNav: blogOn,
    showInFooter: blogOn,
  };
  // If blog was off and still not selected, keep disabled
  if (!blogOn) {
    blog.enabled = false;
    blog.showInNav = false;
    blog.showInFooter = false;
  } else {
    blog.enabled = true;
  }
  raw = mergeBlogSettingsIntoRaw(raw, blog) as Record<string, unknown>;

  const config = parseStorefrontConfig(raw);
  const shopOn =
    selected.has("SHOP") || selectedCapabilities.includes("SHOP");
  const nextPages: StorefrontConfig["pages"] = {
    ...config.pages,
    home: { enabled: true },
    shop: { ...config.pages.shop, enabled: shopOn },
    about: { ...config.pages.about, enabled: selected.has("ABOUT") },
    contact: { ...config.pages.contact, enabled: selected.has("CONTACT") },
  };

  return {
    ...raw,
    ...config,
    pages: nextPages,
    customPages: pages,
  };
}

export { FAQ_PAGE_ID, PAGE_TO_BUILTIN };
