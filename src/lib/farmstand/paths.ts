import type { CartMode } from "@/generated/prisma/client";

export const FARMSTAND_PATH = "/farmstand";

/** `/farmstand` for the owner's main stand, `/farmstand/{stand}` for any other. */
export function farmstandRootPath(standSlug: string, isMainStand: boolean): string {
  return isMainStand ? FARMSTAND_PATH : `${FARMSTAND_PATH}/${encodeURIComponent(standSlug.trim().toLowerCase())}`;
}

/** Customer Choice stands open straight on the pay page. */
export function withCartModePath(url: string, cartMode: CartMode | "PRODUCT" | "CUSTOMER_CHOICE"): string {
  return cartMode === "CUSTOMER_CHOICE" ? `${url}/pay` : url;
}

/**
 * The `/s/{stand}` form of a browser path on a seller host, where the stand pages are
 * served at `/farmstand[/{stand}]/…` (or at `/` when the owner has no published website).
 */
export function standPathFromFarmstand(pathname: string, standSlug: string): string {
  const base = `/s/${standSlug}`;
  if (pathname === "/") return base;
  if (pathname !== FARMSTAND_PATH && !pathname.startsWith(`${FARMSTAND_PATH}/`)) return pathname;
  const rest = pathname.slice(FARMSTAND_PATH.length);
  const own = `/${standSlug}`;
  if (rest === own || rest.startsWith(`${own}/`)) return `${base}${rest.slice(own.length)}`;
  return `${base}${rest}`;
}
