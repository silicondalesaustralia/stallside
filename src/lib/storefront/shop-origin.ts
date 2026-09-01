const COOKIE = "vendl_shop_slug";

export function shopOriginCookieName(): string {
  return COOKIE;
}

/** Client: persist storefront slug so cart/checkout can return to the shop journey. */
export function writeShopOrigin(storefrontSlug: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE}=${encodeURIComponent(storefrontSlug)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
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
  document.cookie = `${COOKIE}=; path=/; max-age=0`;
}

/** Server: read shop origin from request cookies. */
export function readShopOriginFromCookies(
  cookieHeader: string | null | undefined,
): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [name, ...rest] = part.trim().split("=");
    if (name === COOKIE && rest.length > 0) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}
