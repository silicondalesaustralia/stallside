import { prisma } from "@/lib/prisma";
import { getCanonicalStorefrontUrl } from "@/lib/domains/preferred-origin";
import { loadPreferredOriginInput } from "@/lib/domains/resolve";

export type BusinessSiteUrl = {
  url: string;
  /** Host (and path) without the scheme, for display. */
  label: string;
  customDomain: boolean;
  published: boolean;
};

/** The owner's website address: their connected custom domain, otherwise the Vendl subdomain. */
export async function businessSiteUrl(ownerId: string): Promise<BusinessSiteUrl | null> {
  try {
    const storefront = await prisma.storefront.findUnique({
      where: { ownerId },
      select: { id: true, slug: true, isPublished: true },
    });
    if (!storefront) return null;
    const preferred = await loadPreferredOriginInput(storefront);
    const url = getCanonicalStorefrontUrl(preferred, "/");
    const { host, pathname } = new URL(url);
    return {
      url,
      label: `${host}${pathname === "/" ? "" : pathname}`,
      customDomain: Boolean(preferred.primaryCustomHostname),
      published: storefront.isPublished,
    };
  } catch (error) {
    console.error("[businessSiteUrl] lookup failed", error);
    return null;
  }
}
