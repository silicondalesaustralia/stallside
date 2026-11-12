import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { CartMode } from "@/generated/prisma/client";
import { farmstandSubdomainBase, standFarmstandUrl } from "@/lib/farmstand/resolve";

export function legacyStandRedirectsEnabled(): boolean {
  return process.env.LEGACY_STAND_REDIRECTS !== "off";
}

/**
 * Sends `vendl.app/s/{stand}/…` links and printed QR codes to the same page on the stand's
 * farmstand (`{sub}.vendl.app/farmstand/…`), whether or not the owner has a website.
 * Requests already on a seller host are served in place. Pay (Customer Choice), checkout
 * and manage pages don't call this, so they never move.
 */
export async function redirectStandToFarmstand(standSlug: string): Promise<void> {
  if (!legacyStandRedirectsEnabled()) return;
  const h = await headers();
  if (h.get("x-vendl-tenant-slug")) return;
  const pathname = h.get("x-stallside-pathname") ?? "";
  if (!pathname.startsWith("/s/")) return;

  let destination: string | null = null;
  try {
    const base = await farmstandSubdomainBase(decodeURIComponent(standSlug));
    if (base) {
      const rest = pathname.split("/").slice(3).join("/");
      destination = `${base}${rest ? `/${rest}` : ""}${h.get("x-stallside-search") ?? ""}`;
    }
  } catch (err) {
    console.error("[stand-redirect] farmstand lookup failed; serving stand page", err);
  }
  if (destination) redirect(destination);
}

/** The stand's public farmstand link as owners should see it. */
export async function standPublicHome(
  standSlug: string,
  cartMode: CartMode | "PRODUCT" | "CUSTOMER_CHOICE",
): Promise<{ url: string; label: string }> {
  const url = await standFarmstandUrl(standSlug, cartMode);
  const { host, pathname } = new URL(url);
  return { url, label: `${host}${pathname === "/" ? "" : pathname}` };
}
