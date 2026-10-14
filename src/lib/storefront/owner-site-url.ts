import { prisma } from "@/lib/prisma";
import { appBaseUrl } from "@/lib/app-url";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";
import { getCanonicalStorefrontUrl } from "@/lib/domains/preferred-origin";

/** Builds a website path; `draft` adds the owner preview flag, `basePath` "" gives a site-relative path. */
export type SitePathBuilder = (storefrontSlug: string, draft: boolean, basePath?: string) => string;

/**
 * Where the owner's "View on site" button should go: the live URL once the website is
 * published, otherwise the draft preview. Null when the owner has no website yet.
 */
export async function ownerSiteUrl(ownerId: string, build: SitePathBuilder): Promise<string | null> {
  try {
    const storefront = await prisma.storefront.findUnique({
      where: { ownerId },
      select: { id: true, slug: true, isPublished: true },
    });
    if (!storefront) return null;
    if (!storefront.isPublished) return `${appBaseUrl()}${build(storefront.slug, true)}`;
    const primaryCustomHostname = await loadPrimaryCustomHostname(storefront.id);
    return getCanonicalStorefrontUrl(
      { slug: storefront.slug, primaryCustomHostname },
      build(storefront.slug, false, ""),
    );
  } catch (err) {
    console.error("[ownerSiteUrl] could not resolve website URL", err);
    return null;
  }
}
