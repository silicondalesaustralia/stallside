import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CartMode, ProductChannelType } from "@/generated/prisma/client";
import { businessPageProductWhere } from "@/lib/product-visibility";
import { publishedWebsiteForStand, standWebsiteUrl, type StandWebsite } from "./stand-website";

/** Where an old stand page lives on the website. Pay (Customer Choice), checkout and manage links never move. */
export type LegacyStandTarget =
  | { kind: "home" }
  | { kind: "cart" }
  | { kind: "product"; productSlug: string }
  | { kind: "category"; categorySlug: string }
  | { kind: "preOrders" }
  | { kind: "preOrder"; pageSlug: string }
  | { kind: "subscriptions" }
  | { kind: "subscription"; offerSlug: string };

export function legacyStandRedirectsEnabled(): boolean {
  return process.env.LEGACY_STAND_REDIRECTS !== "off";
}

const seg = (s: string) => encodeURIComponent(decodeURIComponent(s).trim().toLowerCase());

async function websitePath(site: StandWebsite, target: LegacyStandTarget): Promise<string> {
  switch (target.kind) {
    case "home":
      return "/";
    case "cart":
      return "/cart";
    case "category":
      return `/${seg(target.categorySlug)}`;
    case "preOrders":
      return "/menus";
    case "preOrder":
      return `/pre-orders/${seg(target.pageSlug)}`;
    case "subscriptions":
      return "/subscriptions";
    case "subscription":
      return `/subscriptions/${seg(target.offerSlug)}`;
    case "product": {
      const slug = decodeURIComponent(target.productSlug).trim().toLowerCase();
      const onSite = await prisma.product.findFirst({
        where: {
          AND: [
            { slug },
            businessPageProductWhere,
            { channels: { some: { channelType: ProductChannelType.ONLINE, standId: site.standId, isEnabled: true } } },
          ],
        },
        select: { id: true },
      });
      return onSite ? `/products/${seg(slug)}` : "/shop";
    }
  }
}

/**
 * Sends old `vendl.app/s/{stand}/…` links and printed QR codes to the same page on the
 * stand's published website, in one hop. Temporary (307) so unpublishing restores the
 * stand pages. Only acts on requests for `/s/…` itself, so website routes that reuse
 * stand page components are never redirected.
 */
export async function redirectLegacyStandToWebsite(standSlug: string, target: LegacyStandTarget): Promise<void> {
  if (!legacyStandRedirectsEnabled()) return;
  const h = await headers();
  const pathname = h.get("x-stallside-pathname") ?? "";
  if (!pathname.startsWith("/s/")) return;

  let destination: string | null = null;
  try {
    const site = await publishedWebsiteForStand(decodeURIComponent(standSlug));
    if (site && site.cartMode !== CartMode.CUSTOMER_CHOICE) {
      destination = `${standWebsiteUrl(site, await websitePath(site, target))}${h.get("x-stallside-search") ?? ""}`;
    }
  } catch (err) {
    console.error("[legacy-stand-redirect] lookup failed; serving stand page", err);
  }
  if (destination) redirect(destination);
}
