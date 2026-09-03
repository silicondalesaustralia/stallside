import type { StorefrontBlogSettings } from "./blog";
import {
  defaultFooterColumn,
  isFooterColumnId,
  resolveFooterColumn,
  type FooterColumnId,
  type StorefrontCustomPage,
} from "./custom-pages";
import { customPagePublicPath } from "./custom-page-paths";
import { shopBlogPath } from "@/lib/storefront/paths";

export const NAV_BLOG_KEY = "__blog__";

export type NavEditorItem = {
  key: string;
  title: string;
  navLabel: string;
  showInNav: boolean;
  showInFooter: boolean;
  sortOrder: number;
  enabled: boolean;
  editHref: string | null;
  placement: "page" | "blog";
  footerColumn: FooterColumnId;
};

export type NavigationLayoutPayload = {
  headerOrder: string[];
  footerOrder: string[];
  labels: Record<string, string>;
  headerVisible: Record<string, boolean>;
  footerVisible: Record<string, boolean>;
  footerColumns: Record<string, FooterColumnId>;
};

export function blogNavEditorItem(
  settings: StorefrontBlogSettings,
): NavEditorItem {
  return {
    key: NAV_BLOG_KEY,
    title: "Blog",
    navLabel: settings.navLabel || "Blog",
    showInNav: settings.showInNav,
    showInFooter: Boolean(settings.showInFooter),
    sortOrder: settings.navSortOrder,
    enabled: settings.enabled,
    editHref: "/dashboard/website/blog",
    placement: "blog",
    footerColumn: "visit",
  };
}

export function pageNavEditorItem(page: StorefrontCustomPage): NavEditorItem {
  return {
    key: page.id,
    title: page.title,
    navLabel: page.navLabel || page.title,
    showInNav: page.showInNav,
    showInFooter: page.showInFooter,
    sortOrder: page.sortOrder,
    enabled: page.enabled,
    editHref: `/dashboard/website/pages/${page.id}`,
    placement: "page",
    footerColumn: resolveFooterColumn(page),
  };
}

export function buildNavEditorItems(
  pages: StorefrontCustomPage[],
  blogSettings: StorefrontBlogSettings,
): NavEditorItem[] {
  const pageItems = pages.map((p) => pageNavEditorItem(p));
  if (blogSettings.enabled) {
    pageItems.push(blogNavEditorItem(blogSettings));
  }
  return pageItems;
}

export function headerNavItems(items: NavEditorItem[]): NavEditorItem[] {
  return items
    .filter((i) => i.showInNav && (i.placement === "blog" || i.enabled))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function footerNavItems(items: NavEditorItem[]): NavEditorItem[] {
  return items
    .filter(
      (i) =>
        i.showInFooter &&
        i.enabled &&
        (i.placement === "page" || i.placement === "blog"),
    )
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function footerColumnItems(
  items: NavEditorItem[],
  column: FooterColumnId,
): NavEditorItem[] {
  return footerNavItems(items).filter((i) => i.footerColumn === column);
}

export function navPoolItems(items: NavEditorItem[]): NavEditorItem[] {
  return items.filter((i) => i.enabled || i.placement === "blog");
}

export function buildStudioHeaderNav(
  pages: StorefrontCustomPage[],
  blogSettings: StorefrontBlogSettings,
  storefrontSlug: string,
  draft?: boolean,
  basePath?: string,
): { slug: string; label: string; href: string }[] {
  const items = buildNavEditorItems(pages, blogSettings);
  return headerNavItems(items).map((item) => {
    if (item.placement === "blog") {
      return {
        slug: "blog",
        label: item.navLabel,
        href: shopBlogPath(storefrontSlug, draft, basePath),
      };
    }
    const page = pages.find((p) => p.id === item.key);
    if (!page) {
      return { slug: item.key, label: item.navLabel, href: "#" };
    }
    return {
      slug: page.slug,
      label: item.navLabel,
      href: customPagePublicPath(storefrontSlug, page, draft, basePath),
    };
  });
}

export function applyNavigationLayout(
  pages: StorefrontCustomPage[],
  blogSettings: StorefrontBlogSettings,
  payload: NavigationLayoutPayload,
): { pages: StorefrontCustomPage[]; blogSettings: StorefrontBlogSettings } {
  const headerOrder = payload.headerOrder;
  const footerOrder = payload.footerOrder;

  const nextPages = pages.map((page) => {
    const headerIdx = headerOrder.indexOf(page.id);
    const footerIdx = footerOrder.indexOf(page.id);
    let sortOrder = page.sortOrder;

    if (headerIdx >= 0) {
      sortOrder = (headerIdx + 1) * 10;
    } else if (footerIdx >= 0) {
      sortOrder = 1000 + (footerIdx + 1) * 10;
    }

    const showInNav =
      payload.headerVisible[page.id] ?? (headerIdx >= 0 ? true : page.showInNav);
    const showInFooter =
      payload.footerVisible[page.id] ?? (footerIdx >= 0 ? true : page.showInFooter);
    const navLabel = payload.labels[page.id]?.trim().slice(0, 40) || page.navLabel;
    const colRaw = payload.footerColumns?.[page.id];
    const footerColumn = isFooterColumnId(colRaw)
      ? colRaw
      : resolveFooterColumn(page);

    return {
      ...page,
      navLabel: navLabel || page.title,
      showInNav,
      showInFooter,
      sortOrder,
      footerColumn,
    };
  });

  const blogHeaderIdx = headerOrder.indexOf(NAV_BLOG_KEY);
  const blogFooterIdx = footerOrder.indexOf(NAV_BLOG_KEY);
  const nextBlog: StorefrontBlogSettings = {
    ...blogSettings,
    showInNav: payload.headerVisible[NAV_BLOG_KEY] ?? blogHeaderIdx >= 0,
    showInFooter: payload.footerVisible[NAV_BLOG_KEY] ?? blogFooterIdx >= 0,
    navLabel:
      payload.labels[NAV_BLOG_KEY]?.trim().slice(0, 40) || blogSettings.navLabel,
    navSortOrder:
      blogHeaderIdx >= 0 ? (blogHeaderIdx + 1) * 10 : blogSettings.navSortOrder,
  };

  return { pages: nextPages, blogSettings: nextBlog };
}

export function layoutFromEditorItems(items: NavEditorItem[]): NavigationLayoutPayload {
  const header = headerNavItems(items);
  const footer = footerNavItems(items);
  const labels: Record<string, string> = {};
  const headerVisible: Record<string, boolean> = {};
  const footerVisible: Record<string, boolean> = {};
  const footerColumns: Record<string, FooterColumnId> = {};

  for (const item of items) {
    labels[item.key] = item.navLabel;
    headerVisible[item.key] = item.showInNav;
    footerVisible[item.key] = item.showInFooter;
    footerColumns[item.key] = item.footerColumn || defaultFooterColumn({
      slug: item.key,
      template: "info",
    });
  }

  return {
    headerOrder: header.map((i) => i.key),
    footerOrder: footer.map((i) => i.key),
    labels,
    headerVisible,
    footerVisible,
    footerColumns,
  };
}
