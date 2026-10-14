import { shopPagePath } from "@/lib/storefront/paths";
import type { StorefrontCustomPage } from "./custom-pages";

export function customPagePublicPath(
  storefrontSlug: string,
  page: StorefrontCustomPage,
  draft = false,
  basePath?: string,
): string {
  if (page.routeKind === "builtin" && page.builtinKey) {
    return shopPagePath(storefrontSlug, page.builtinKey, draft, basePath);
  }
  const root = basePath ?? `/shop/${encodeURIComponent(storefrontSlug)}`;
  const path = `${root}/${encodeURIComponent(page.slug)}`.replace(/\/{2,}/g, "/");
  return draft ? `${path}?draft=1` : path;
}

export function navPagesFromCustomPages(
  pages: StorefrontCustomPage[],
  storefrontSlug: string,
  draft?: boolean,
  basePath?: string,
): { slug: string; label: string; href: string }[] {
  return pages
    .filter((p) => p.enabled && p.showInNav)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((p) => ({
      slug: p.slug,
      label: p.navLabel || p.title,
      href: customPagePublicPath(storefrontSlug, p, draft, basePath),
    }));
}

export function footerPagesFromCustomPages(
  pages: StorefrontCustomPage[],
  storefrontSlug: string,
  draft?: boolean,
  basePath?: string,
): { slug: string; label: string; href: string; column: import("./custom-pages").FooterColumnId }[] {
  const { resolveFooterColumn } = require("./custom-pages") as typeof import("./custom-pages");
  return pages
    .filter((p) => p.enabled && p.showInFooter)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((p) => ({
      slug: p.slug,
      label: p.navLabel || p.title,
      href: customPagePublicPath(storefrontSlug, p, draft, basePath),
      column: resolveFooterColumn(p),
    }));
}
