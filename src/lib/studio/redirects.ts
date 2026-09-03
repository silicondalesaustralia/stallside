export type StorefrontRedirectCode = 301 | 302;

export type StorefrontRedirect = {
  id: string;
  /** Storefront-relative path, e.g. /product/old-slug */
  fromPath: string;
  /** Storefront-relative path or absolute https URL */
  toPath: string;
  code: StorefrontRedirectCode;
  enabled: boolean;
};

export function normalizeRedirectPath(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw);
      if (u.protocol !== "http:" && u.protocol !== "https:") return null;
      return u.toString();
    } catch {
      return null;
    }
  }
  let path = raw.split("?")[0]?.split("#")[0] ?? "";
  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/{2,}/g, "/");
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  path = path.toLowerCase();
  if (path.includes("/shop/")) return null;
  if (!/^\/[a-z0-9/_-]{0,200}$/i.test(path) && path !== "/") return null;
  return path;
}

function isRedirect(raw: unknown): raw is StorefrontRedirect {
  if (!raw || typeof raw !== "object") return false;
  const r = raw as StorefrontRedirect;
  return (
    typeof r.id === "string" &&
    typeof r.fromPath === "string" &&
    typeof r.toPath === "string" &&
    (r.code === 301 || r.code === 302) &&
    typeof r.enabled === "boolean"
  );
}

export function extractStorefrontRedirects(raw: unknown): StorefrontRedirect[] {
  if (!raw || typeof raw !== "object") return [];
  const list = (raw as { storefrontRedirects?: unknown }).storefrontRedirects;
  if (!Array.isArray(list)) return [];
  return list.filter(isRedirect);
}

export function mergeStorefrontRedirectsIntoRaw(
  existingRaw: unknown,
  redirects: StorefrontRedirect[],
): Record<string, unknown> {
  const base =
    existingRaw && typeof existingRaw === "object" && !Array.isArray(existingRaw)
      ? { ...(existingRaw as Record<string, unknown>) }
      : {};
  return { ...base, storefrontRedirects: redirects };
}

export function storefrontRelativePath(
  pathname: string,
  storefrontSlug: string,
): string {
  const slug = storefrontSlug.trim().toLowerCase();
  const prefix = `/shop/${slug}`;
  let path = pathname.split("?")[0] ?? pathname;
  if (path === prefix) return "/";
  if (path.startsWith(`${prefix}/`)) {
    path = path.slice(prefix.length) || "/";
  }
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path.toLowerCase() || "/";
}

export function findStorefrontRedirect(
  redirects: StorefrontRedirect[],
  relativePath: string,
): StorefrontRedirect | null {
  const key = relativePath.toLowerCase();
  return (
    redirects.find((r) => r.enabled && r.fromPath.toLowerCase() === key) ?? null
  );
}

export function sanitizeRedirectInput(input: {
  id?: string;
  fromPath: string;
  toPath: string;
  code?: string | number;
  enabled?: boolean;
}): StorefrontRedirect | null {
  const fromPath = normalizeRedirectPath(input.fromPath);
  const toPath = normalizeRedirectPath(input.toPath);
  if (!fromPath || !toPath) return null;
  if (fromPath === toPath) return null;
  if (fromPath === "/") return null;
  const code: StorefrontRedirectCode =
    Number(input.code) === 302 ? 302 : 301;
  return {
    id: input.id?.trim() || cryptoRandomId(),
    fromPath,
    toPath,
    code,
    enabled: input.enabled !== false,
  };
}

function cryptoRandomId(): string {
  return `redir_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}
