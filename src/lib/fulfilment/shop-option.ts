import { APP_DOMAIN } from "@/lib/constants";

const COOKIE = "vendl_fulfilment_option";

export function shopFulfilmentCookieName(): string {
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

export function writeShopFulfilmentOption(optionId: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE}=${encodeURIComponent(optionId)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${cookieDomainAttr()}`;
}

export function readShopFulfilmentOptionClient(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function clearShopFulfilmentOptionClient(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE}=; path=/; max-age=0${cookieDomainAttr()}`;
}

export function readShopFulfilmentOptionFromCookies(
  cookieHeader: string | null | undefined,
): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === COOKIE && rest.length > 0) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}
