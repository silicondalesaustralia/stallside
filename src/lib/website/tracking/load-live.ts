import { cache } from "react";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { extractStorefrontTracking } from "./config";
import { isConsentCountry } from "./consent";
import { ownerCanUseTagsPixels } from "./entitlements";
import type { StorefrontTracking } from "./types";

export const TAGS_DEBUG_PARAM = "vendl_tags_debug";

/** Published tracking settings for a live site; null when unpublished or the owner isn't on Pro. */
export const loadLiveStorefrontTracking = cache(
  async (slug: string): Promise<StorefrontTracking | null> => {
    const storefront = await prisma.storefront.findFirst({
      where: { slug: slug.trim().toLowerCase(), isPublished: true },
      select: { publishedConfig: true, ownerId: true },
    });
    if (!storefront?.publishedConfig) return null;
    if (!(await ownerCanUseTagsPixels(storefront.ownerId))) return null;
    return extractStorefrontTracking(storefront.publishedConfig);
  },
);

export type TagsRequestContext = {
  /** Seller subdomain or custom domain (never vendl.app/shop/…). */
  tenantHost: boolean;
  /** Seller tags may load: tenant host, not a draft preview or the editor. */
  enabled: boolean;
  debug: boolean;
  euVisitor: boolean;
};

export const tagsRequestContext = cache(async (): Promise<TagsRequestContext> => {
  const h = await headers();
  const tenantHost = Boolean(h.get("x-vendl-tenant-slug"));
  const search = new URLSearchParams(h.get("x-stallside-search") ?? "");
  const pathname = h.get("x-stallside-pathname") ?? "";
  const preview = search.get("draft") === "1" || pathname.includes("/studio-preview");
  return {
    tenantHost,
    enabled: tenantHost && !preview,
    debug: search.get(TAGS_DEBUG_PARAM) === "1",
    euVisitor: isConsentCountry(h.get("x-vercel-ip-country")),
  };
});
