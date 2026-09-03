import { APP_DOMAIN } from "@/lib/constants";

const COOKIE = "vendl_shop_slug";
const RETURN_COOKIE = "vendl_shop_return";

export type ShopReturnMode = "subdomain" | "path";

export function shopOriginCookieName(): string {
  return COOKIE;
}

function cookieDomainAttr(): string {
  if (typeof document === "undefined") return "";
  const host = window.location.hostname.toLowerCase();
  if (host === APP_DOMAIN || host.endsWith(`.${APP_DOMAIN}`)) {
    return `; Domain=.${APP_DOMAIN}`;
  }
  return "";
}

function currentReturnMode(): ShopReturnMode {
  if (typeof document === "undefined") return "path";
  const host = window.location.hostname.toLowerCase();
  if (
    (host.endsWith(`.${APP_DOMAIN}`) && host !== `www.${APP_DOMAIN}`) ||
    host.endsWith(".localhost")
  ) {
    return "subdomain";
  }
  return "path";
}

/** Client: persist storefront slug so cart/checkout can return to the shop journey. */
export function writeShopOrigin(storefrontSlug: string): void {
  if (typeof document === "undefined") return;
  const domain = cookieDomainAttr();
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${COOKIE}=${encodeURIComponent(storefrontSlug)}; path=/; max-age=${maxAge}; SameSite=Lax${domain}`;
  document.cookie = `${RETURN_COOKIE}=${currentReturnMode()}; path=/; max-age=${maxAge}; SameSite=Lax${domain}`;
}

export function readShopOriginClient(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function clearShopOriginClient(): void {
  if (typeof document === "undefined") return;
  const domain = cookieDomainAttr();
  document.cookie = `${COOKIE}=; path=/; max-age=0${domain}`;
  document.cookie = `${RETURN_COOKIE}=; path=/; max-age=0${domain}`;
}

function readNamedCookie(
  cookieHeader: string | null | undefined,
  name: string,
): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === name && rest.length > 0) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

/** Server: read shop origin from request cookies. */
export function readShopOriginFromCookies(
  cookieHeader: string | null | undefined,
): string | null {
  return readNamedCookie(cookieHeader, COOKIE);
}

export function readShopReturnModeFromCookies(
  cookieHeader: string | null | undefined,
): ShopReturnMode {
  const mode = readNamedCookie(cookieHeader, RETURN_COOKIE);
  return mode === "subdomain" ? "subdomain" : "path";
}
