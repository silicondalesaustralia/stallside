import { APP_DOMAIN } from "@/lib/constants";
import { appBaseUrl } from "@/lib/app-url";
import {
  storefrontSubdomainOrigin,
  storefrontSubdomainPrimaryEnabled,
} from "@/lib/tenancy/public-url";

export type PreferredOriginInput = {
  slug: string;
  /** Active primary custom hostname if any (normalized). */
  primaryCustomHostname?: string | null;
  /** Prefer path-style (drafts, previews). */
  forcePath?: boolean;
  draft?: boolean;
};

/**
 * Absolute origin for a published storefront's preferred public URL.
 * Custom primary → https://www.example.com
 * Else subdomain primary flag → https://slug.vendl.app
 * Else → https://vendl.app (path appended by getStorefrontUrl)
 */
export function getStorefrontOrigin(input: PreferredOriginInput): string {
  const slug = input.slug.trim().toLowerCase();
  if (input.draft || input.forcePath) {
    return appBaseUrl();
  }
  const custom = input.primaryCustomHostname?.trim().toLowerCase();
  if (custom) {
    return `https://${custom}`;
  }
  if (storefrontSubdomainPrimaryEnabled()) {
    return storefrontSubdomainOrigin(slug);
  }
  return appBaseUrl();
}

function normalizePath(path?: string): string {
  if (!path || path === "/") return "";
  return path.startsWith("/") ? path : `/${path}`;
}

/**
 * Public absolute URL for a storefront path.
 * Path-mode origin uses /shop/{slug}{path}; host-mode uses {path} on that host.
 */
export function getStorefrontUrl(
  input: PreferredOriginInput,
  path = "",
): string {
  const slug = input.slug.trim().toLowerCase();
  const suffix = normalizePath(path);
  const draftQ = input.draft
    ? suffix.includes("?")
      ? "&draft=1"
      : "?draft=1"
    : "";

  if (input.draft || input.forcePath || !input.primaryCustomHostname) {
    if (
      !input.draft &&
      !input.forcePath &&
      storefrontSubdomainPrimaryEnabled() &&
      !input.primaryCustomHostname
    ) {
      return `${storefrontSubdomainOrigin(slug)}${suffix}${draftQ}`;
    }
    if (input.primaryCustomHostname && !input.draft && !input.forcePath) {
      return `https://${input.primaryCustomHostname}${suffix}${draftQ}`;
    }
    const root = `/shop/${encodeURIComponent(slug)}`;
    return `${appBaseUrl()}${root}${suffix}${draftQ}`;
  }

  return `https://${input.primaryCustomHostname}${suffix}${draftQ}`;
}

export function getCanonicalStorefrontUrl(
  input: PreferredOriginInput,
  path = "",
): string {
  return getStorefrontUrl({ ...input, draft: false, forcePath: false }, path);
}

/** Vendl subdomain host for a slug (always available as alternate). */
export function vendlSubdomainHostname(slug: string): string {
  return `${slug.trim().toLowerCase()}.${APP_DOMAIN}`;
}
