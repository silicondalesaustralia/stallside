import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { CartMode } from "@/generated/prisma/client";
import { standFarmstandUrl } from "@/lib/farmstand/resolve";
import { storefrontPathFromLegacyStand } from "./legacy-stand-path-map";
import {
  storefrontPublicSiteForStand,
  storefrontPublicUrl,
} from "./stand-public-url";

export function legacyStandRedirectsEnabled(): boolean {
  return process.env.LEGACY_STAND_REDIRECTS !== "off";
}

/**
 * Sends legacy `/s/{stand}/…` links (apex or printed QR) to the same page on the
 * owner's shop host: `{sub}.vendl.app/products/…` or `/{category}/…`, etc.
 * Pay / checkout / subscription-manage stay on the farmstand. Kill switch:
 * `LEGACY_STAND_REDIRECTS=off`.
 */
export async function redirectStandToFarmstand(standSlug: string): Promise<void> {
  if (!legacyStandRedirectsEnabled()) return;
  const h = await headers();
  const pathname = h.get("x-stallside-pathname") ?? "";
  if (!pathname.startsWith("/s/")) return;

  // Already on the seller host at /s/… — still move product/catalogue links to shop paths.
  const search = h.get("x-stallside-search") ?? "";
  let destination: string | null = null;
  try {
    const shopPath = await storefrontPathFromLegacyStand(
      decodeURIComponent(standSlug),
      pathname,
    );
    if (shopPath == null) return;
    const site = await storefrontPublicSiteForStand(decodeURIComponent(standSlug));
    if (!site) return;
    const tenant = h.get("x-vendl-tenant-slug");
    destination = tenant
      ? `${shopPath}${search}`
      : `${storefrontPublicUrl(site, shopPath)}${search}`;
  } catch (err) {
    console.error("[stand-redirect] shop lookup failed; serving stand page", err);
  }
  if (destination) redirect(destination);
}

/** The stand's public shop home as owners should see it. */
export async function standPublicHome(
  standSlug: string,
  _cartMode: CartMode | "PRODUCT" | "CUSTOMER_CHOICE",
): Promise<{ url: string; label: string }> {
  const site = await storefrontPublicSiteForStand(standSlug);
  if (site) {
    const url = storefrontPublicUrl(site, "/");
    const { host, pathname } = new URL(url);
    return { url, label: `${host}${pathname === "/" ? "" : pathname}` };
  }
  const url = await standFarmstandUrl(standSlug, _cartMode);
  const { host, pathname } = new URL(url);
  return { url, label: `${host}${pathname === "/" ? "" : pathname}` };
}
