import {
  extractStorefrontRedirects,
  mergeStorefrontRedirectsIntoRaw,
  normalizeRedirectPath,
  type StorefrontRedirect,
} from "./redirects";

function newId(): string {
  return `redir_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

/**
 * Config with a 301 from an item's old URL to its new one, so links and printed QR codes
 * keep working after a rename. Chains are flattened (anything pointing at `from` now points
 * at `to`) and any redirect away from `to` is dropped, since `to` has content again.
 */
export function withRenameRedirect(raw: unknown, from: string, to: string): Record<string, unknown> {
  const fromPath = normalizeRedirectPath(from);
  const toPath = normalizeRedirectPath(to);
  const list = extractStorefrontRedirects(raw);
  if (!fromPath || !toPath || fromPath === toPath || fromPath === "/") {
    return mergeStorefrontRedirectsIntoRaw(raw, list);
  }
  const next: StorefrontRedirect[] = list
    .filter((r) => r.fromPath !== fromPath && r.fromPath !== toPath)
    .map((r) => (r.toPath === fromPath ? { ...r, toPath } : r))
    .filter((r) => r.fromPath !== r.toPath);
  next.push({ id: newId(), fromPath, toPath, code: 301, enabled: true });
  return mergeStorefrontRedirectsIntoRaw(raw, next);
}

/** Config without redirects away from `path` (a new item now lives there). */
export function withoutRedirectFrom(raw: unknown, path: string): Record<string, unknown> {
  const key = normalizeRedirectPath(path);
  const list = extractStorefrontRedirects(raw);
  return mergeStorefrontRedirectsIntoRaw(raw, key ? list.filter((r) => r.fromPath !== key) : list);
}
