import { appBaseUrl } from "@/lib/app-url";
import type { StorefrontBlogPost, StorefrontBlogTopic } from "@/lib/studio/blog";
import { blogPostRelativePath } from "@/lib/studio/blog-topics";
import { productRelativePath } from "@/lib/catalogue/main-category";

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
    `/${encodeURIComponent(categorySlug)}`,
  );
  return draft ? `${base}?draft=1` : base;
}

/** `/{main-category}/{product}`; a bare slug or uncategorised product uses `/products/{product}`. */
export function shopProductPath(
  storefrontSlug: string,
  product: string | { slug: string; categorySlug?: string | null },
  draft = false,
  basePath?: string,
): string {
  const rel = typeof product === "string"
    ? productRelativePath(product)
    : productRelativePath(product.slug, product.categorySlug);
  const base = joinRoot(rootFor(storefrontSlug, basePath), rel);
  return draft ? `${base}?draft=1` : base;
}

export function shopMenusPath(
  storefrontSlug: string,
  draft = false,
  basePath?: string,
): string {
  const base = joinRoot(rootFor(storefrontSlug, basePath), "/menus");
  return draft ? `${base}?draft=1` : base;
}

export function shopMenuPath(
  storefrontSlug: string,
  menuSlug: string,
  draft = false,
  basePath?: string,
  preOrder = false,
): string {
  const base = joinRoot(
    rootFor(storefrontSlug, basePath),
    `/${preOrder ? "pre-orders" : "menus"}/${encodeURIComponent(menuSlug)}`,
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
    `/${encodeURIComponent(pageSlug)}`,
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

/** Blog posts live under their main category: `/{category}/{post}`. */
export function shopBlogPostPath(
  storefrontSlug: string,
  post: Pick<StorefrontBlogPost, "slug" | "topicIds" | "mainTopicId">,
  topics: StorefrontBlogTopic[],
  draft = false,
  basePath?: string,
): string {
  const base = joinRoot(rootFor(storefrontSlug, basePath), blogPostRelativePath(post, topics));
  return draft ? `${base}?draft=1` : base;
}

export function shopBlogTopicPath(
  storefrontSlug: string,
  topicSlug: string,
  draft = false,
  basePath?: string,
): string {
  const base = joinRoot(rootFor(storefrontSlug, basePath), `/${encodeURIComponent(topicSlug)}`);
  return draft ? `${base}?draft=1` : base;
}

export function shopPreOrdersPath(storefrontSlug: string, draft = false, basePath?: string): string {
  const base = joinRoot(rootFor(storefrontSlug, basePath), "/pre-orders");
  return draft ? `${base}?draft=1` : base;
}

export function shopPreOrderPath(
  storefrontSlug: string,
  slug: string,
  draft = false,
  basePath?: string,
): string {
  const base = joinRoot(rootFor(storefrontSlug, basePath), `/pre-orders/${encodeURIComponent(slug)}`);
  return draft ? `${base}?draft=1` : base;
}

export function shopSubscriptionsPath(
  storefrontSlug: string,
  offerSlug?: string,
  draft = false,
  basePath?: string,
): string {
  const rest = offerSlug ? `/subscriptions/${encodeURIComponent(offerSlug)}` : "/subscriptions";
  const base = joinRoot(rootFor(storefrontSlug, basePath), rest);
  return draft ? `${base}?draft=1` : base;
}

export function shopFullUrl(storefrontSlug: string, path = ""): string {
  const slug = encodeURIComponent(storefrontSlug);
  return `${appBaseUrl()}/shop/${slug}${path}`;
}
