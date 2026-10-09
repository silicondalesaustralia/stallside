import { appBaseUrl } from "@/lib/app-url";

function rootFor(
  storefrontSlug: string,
  basePath?: string,
): string {
  if (basePath !== undefined) return basePath;
  return `/shop/${encodeURIComponent(storefrontSlug)}`;
}

function joinRoot(root: string, rest: string): string {
  if (!root) return rest.startsWith("/") ? rest : `/${rest}`;
  return `${root}${rest.startsWith("/") ? rest : `/${rest}`}`.replace(
    /\/{2,}/g,
    "/",
  );
}

export function shopHomePath(
  storefrontSlug: string,
  draft = false,
  basePath?: string,
): string {
  const root = rootFor(storefrontSlug, basePath);
  const base = root || "/";
  if (!draft) return base;
  return base === "/" ? "/?draft=1" : `${base}?draft=1`;
}

export function shopPagePath(
  storefrontSlug: string,
  page: "shop" | "about" | "contact" | "privacy" | "terms" | "returns" | "shipping" | "blog",
  draft = false,
  basePath?: string,
): string {
  const base = joinRoot(rootFor(storefrontSlug, basePath), `/${page}`);
  return draft ? `${base}?draft=1` : base;
}

export function shopCategoryPath(
  storefrontSlug: string,
  categorySlug: string,
  draft = false,
  basePath?: string,
): string {
  const base = joinRoot(
    rootFor(storefrontSlug, basePath),
    `/shop/${encodeURIComponent(categorySlug)}`,
  );
  return draft ? `${base}?draft=1` : base;
}

export function shopProductPath(
  storefrontSlug: string,
  productSlug: string,
  draft = false,
  basePath?: string,
): string {
  const base = joinRoot(
    rootFor(storefrontSlug, basePath),
    `/products/${encodeURIComponent(productSlug)}`,
  );
  return draft ? `${base}?draft=1` : base;
}

export function shopMenusPath(
  storefrontSlug: string,
  draft = false,
  basePath?: string,
): string {
  const base = joinRoot(rootFor(storefrontSlug, basePath), "/menu");
  return draft ? `${base}?draft=1` : base;
}

export function shopMenuPath(
  storefrontSlug: string,
  menuSlug: string,
  draft = false,
  basePath?: string,
): string {
  const base = joinRoot(
    rootFor(storefrontSlug, basePath),
    `/menu/${encodeURIComponent(menuSlug)}`,
  );
  return draft ? `${base}?draft=1` : base;
}

export function shopCustomPagePath(
  storefrontSlug: string,
  pageSlug: string,
  draft = false,
  basePath?: string,
): string {
  const base = joinRoot(
    rootFor(storefrontSlug, basePath),
    `/pages/${encodeURIComponent(pageSlug)}`,
  );
  return draft ? `${base}?draft=1` : base;
}

export function shopBlogPath(
  storefrontSlug: string,
  draft = false,
  basePath?: string,
): string {
  const base = joinRoot(rootFor(storefrontSlug, basePath), "/blog");
  return draft ? `${base}?draft=1` : base;
}

export function shopBlogPostPath(
  storefrontSlug: string,
  postSlug: string,
  draft = false,
  basePath?: string,
): string {
  const base = joinRoot(
    rootFor(storefrontSlug, basePath),
    `/blog/${encodeURIComponent(postSlug)}`,
  );
  return draft ? `${base}?draft=1` : base;
}

export function shopFullUrl(storefrontSlug: string, path = ""): string {
  const slug = encodeURIComponent(storefrontSlug);
  return `${appBaseUrl()}/shop/${slug}${path}`;
}
