import { extractStorefrontRedirects, normalizeRedirectPath } from "./redirects";

/** Link tokens that name an item by slug (see `button-link.ts`). */
export type SlugLinkKind = "category" | "product" | "nav";

function mapStrings(value: unknown, map: Map<string, string>): unknown {
  if (typeof value === "string") return map.get(value) ?? value;
  if (Array.isArray(value)) return value.map((v) => mapStrings(v, map));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mapStrings(v, map)]));
  }
  return value;
}

/**
 * Config with every `{kind}:{old slug}` link (menus, footer, buttons) pointed at `{kind}:{slug}`.
 * Old slugs are `oldSlugs` plus any address that redirects to `{pathPrefix}{slug}`, so links
 * left behind by earlier renames are repaired too.
 */
export function withLinksRetargeted(
  raw: unknown,
  kind: SlugLinkKind,
  pathPrefix: string,
  slug: string,
  oldSlugs: string[] = [],
): Record<string, unknown> {
  const base = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const target = normalizeRedirectPath(`${pathPrefix}${slug}`);
  const olds = new Set(oldSlugs);
  for (const r of extractStorefrontRedirects(raw)) {
    if (r.toPath === target && r.fromPath.startsWith(pathPrefix)) olds.add(r.fromPath.slice(pathPrefix.length));
  }
  olds.delete(slug);
  if (olds.size === 0) return base;
  const map = new Map([...olds].map((old) => [`${kind}:${old}`, `${kind}:${slug}`]));
  return mapStrings(base, map) as Record<string, unknown>;
}
