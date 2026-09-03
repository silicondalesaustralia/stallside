import { APP_DOMAIN } from "@/lib/constants";
import { appBaseUrl } from "@/lib/app-url";
import {
  isSellerStorefrontHost,
  resolveHostname,
} from "@/lib/tenancy/hostname";

function pathStyleRoot(slug: string): string {
  return `/shop/${encodeURIComponent(slug.trim().toLowerCase())}`;
}

/** After Cloudflare/Vercel wildcard is proven, set to "1" in production. */
export function storefrontSubdomainPrimaryEnabled(): boolean {
  return process.env.NEXT_PUBLIC_STOREFRONT_SUBDOMAIN_PRIMARY === "1";
}

export function storefrontSubdomainHost(slug: string): string {
  return `${slug.trim().toLowerCase()}.${APP_DOMAIN}`;
}

export function storefrontSubdomainOrigin(slug: string): string {
  return `https://${storefrontSubdomainHost(slug)}`;
}

/**
 * Path prefix for in-app storefront links.
 * Empty on seller subdomain hosts; `/shop/{slug}` on apex/path mode.
 */
export function storefrontBasePath(
  slug: string,
  hostHeader?: string | null,
): string {
  const resolution = resolveHostname(hostHeader);
  if (resolution.type === "CUSTOM_DOMAIN") {
    return "";
  }
  if (
    isSellerStorefrontHost(resolution) &&
    "slug" in resolution &&
    resolution.slug === slug.trim().toLowerCase()
  ) {
    return "";
  }
  return pathStyleRoot(slug);
}

/** Absolute public storefront URL (homepage or subpath). */
export function storefrontPublicUrl(
  slug: string,
  options: {
    path?: string;
    draft?: boolean;
    /** Force path-style even when subdomain primary is on (local/previews). */
    forcePath?: boolean;
    hostHeader?: string | null;
    /** Active primary custom hostname (Phase 9). */
    primaryCustomHostname?: string | null;
  } = {},
): string {
  const cleanSlug = slug.trim().toLowerCase();
  const suffix = normalizePublicPath(options.path);
  const draftQ = options.draft ? (suffix.includes("?") ? "&draft=1" : "?draft=1") : "";
  const custom = options.primaryCustomHostname?.trim().toLowerCase() || null;

  const resolution = options.hostHeader
    ? resolveHostname(options.hostHeader)
    : null;

  if (
    resolution &&
    resolution.type === "CUSTOM_DOMAIN" &&
    custom &&
    resolution.hostname === custom
  ) {
    return `https://${custom}${suffix}${draftQ}`;
  }

  if (
    resolution &&
    isSellerStorefrontHost(resolution) &&
    "slug" in resolution &&
    resolution.slug === cleanSlug
  ) {
    if (custom && !options.draft) {
      return `https://${custom}${suffix}${draftQ}`;
    }
    const origin =
      resolution.type === "LOCAL_SUBDOMAIN"
        ? `http://${cleanSlug}.localhost:3000`
        : storefrontSubdomainOrigin(cleanSlug);
    return `${origin}${suffix}${draftQ}`;
  }

  if (!options.forcePath && !options.draft && custom) {
    return `https://${custom}${suffix}${draftQ}`;
  }

  if (
    !options.forcePath &&
    !options.draft &&
    storefrontSubdomainPrimaryEnabled()
  ) {
    return `${storefrontSubdomainOrigin(cleanSlug)}${suffix}${draftQ}`;
  }

  return `${appBaseUrl()}${pathStyleRoot(cleanSlug)}${suffix}${draftQ}`;
}

function normalizePublicPath(path?: string): string {
  if (!path || path === "/") return "";
  return path.startsWith("/") ? path : `/${path}`;
}

export function storefrontReturnShopUrl(
  slug: string,
  mode: "subdomain" | "path",
): string {
  const clean = slug.trim().toLowerCase();
  if (mode === "subdomain") {
    const isLocal =
      process.env.NODE_ENV !== "production" && !process.env.VERCEL;
    if (isLocal) return `http://${clean}.localhost:3000/shop`;
    return `${storefrontSubdomainOrigin(clean)}/shop`;
  }
  return `/shop/${encodeURIComponent(clean)}/shop`;
}
