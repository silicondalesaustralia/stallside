const KEY = "slugAliases";
const MAX_ALIASES = 20;

/** Previous storefront slugs (old subdomains / `/shop/{slug}` paths) that forward to the current one. */
export function slugAliasesFromConfig(raw: unknown): string[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  const list = (raw as Record<string, unknown>)[KEY];
  return Array.isArray(list) ? list.filter((s): s is string => typeof s === "string") : [];
}

/** Config remembering `oldSlug`; the current slug is never kept as an alias. */
export function withSlugAlias(raw: unknown, oldSlug: string, currentSlug: string): Record<string, unknown> {
  const base = raw && typeof raw === "object" && !Array.isArray(raw) ? { ...(raw as Record<string, unknown>) } : {};
  const old = oldSlug.trim().toLowerCase();
  const current = currentSlug.trim().toLowerCase();
  const next = [old, ...slugAliasesFromConfig(raw).filter((s) => s !== old)].filter((s) => s && s !== current);
  base[KEY] = next.slice(0, MAX_ALIASES);
  return base;
}
