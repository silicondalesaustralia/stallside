/**
 * Clean storefront URLs share one top-level namespace: `/{slug}` can be a custom page,
 * a product category or a blog category (checked in that order). These words are taken
 * by fixed routes, built-in pages or the platform, so none of the three may use them.
 */
export const RESERVED_SITE_SLUGS = new Set([
  // fixed storefront routes and built-in pages
  "shop", "products", "product", "menus", "menu", "pre-orders", "subscriptions", "pages",
  "blog", "about", "contact", "privacy", "terms", "returns", "shipping",
  "studio-preview", "craft-preview", "puck-preview",
  // platform paths the middleware never rewrites on seller hosts
  "cart", "checkout", "api", "s", "c", "f", "q", "login", "signup", "dashboard", "admin",
  "search", "account", "unsubscribe", "_next",
]);

export type SiteSlugKind = "page" | "category" | "blogCategory";

export type SiteSlugOwner = { kind: SiteSlugKind; id: string; slug: string; label: string };

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isWellFormedSiteSlug(slug: string): boolean {
  return slug.length > 0 && slug.length <= 64 && SLUG_RE.test(slug);
}

export function isReservedSiteSlug(slug: string): boolean {
  return RESERVED_SITE_SLUGS.has(slug.trim().toLowerCase());
}

const KIND_LABEL: Record<SiteSlugKind, string> = {
  page: "page",
  category: "product category",
  blogCategory: "blog category",
};

/**
 * Why `slug` can't be used for a new/renamed item, or null when it's free.
 * `self` is the item being renamed (it may keep its own slug).
 */
export function siteSlugProblem(
  slug: string,
  owners: SiteSlugOwner[],
  self?: { kind: SiteSlugKind; id: string },
): string | null {
  const key = slug.trim().toLowerCase();
  if (!isWellFormedSiteSlug(key)) return "Use lowercase letters, numbers and dashes only.";
  if (isReservedSiteSlug(key)) return `"/${key}" is reserved by your website. Choose another.`;
  const taken = owners.find(
    (o) => o.slug === key && !(self && o.kind === self.kind && o.id === self.id),
  );
  if (taken) {
    return `"/${key}" is already used by the ${KIND_LABEL[taken.kind]} "${taken.label}". Choose another.`;
  }
  return null;
}

/** First free `{base}`, `{base}-2`, `{base}-3`… */
export function suggestSiteSlug(base: string, owners: SiteSlugOwner[]): string {
  const root = base.trim().toLowerCase() || "page";
  const used = new Set(owners.map((o) => o.slug));
  const free = (s: string) => !used.has(s) && !isReservedSiteSlug(s);
  if (free(root)) return root;
  for (let i = 2; i < 100; i++) {
    const candidate = `${root}-${i}`;
    if (free(candidate)) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

const ORDER: SiteSlugKind[] = ["page", "category", "blogCategory"];

/** Which item serves `/{slug}`: pages win, then product categories, then blog categories. */
export function resolveSiteSlugOwner(slug: string, owners: SiteSlugOwner[]): SiteSlugOwner | null {
  const key = slug.trim().toLowerCase();
  if (isReservedSiteSlug(key)) return null;
  for (const kind of ORDER) {
    const hit = owners.find((o) => o.kind === kind && o.slug === key);
    if (hit) return hit;
  }
  return null;
}

/** Items that share a slug with a higher-priority item and so can't be reached. */
export function shadowedSiteSlugs(owners: SiteSlugOwner[]): SiteSlugOwner[] {
  return owners.filter((o) => {
    if (isReservedSiteSlug(o.slug)) return true;
    const winner = resolveSiteSlugOwner(o.slug, owners);
    return winner !== null && (winner.kind !== o.kind || winner.id !== o.id);
  });
}
