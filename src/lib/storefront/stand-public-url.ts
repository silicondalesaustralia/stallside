import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/legal";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";
import { getCanonicalStorefrontUrl } from "@/lib/domains/preferred-origin";
import { shopPagePath, shopProductPath } from "@/lib/storefront/paths";
import { standProductPath } from "@/lib/stand-seo";

export type StorefrontPublicSite = {
  storefrontSlug: string;
  primaryCustomHostname: string | null;
  published: boolean;
};

/** Owner's shop host (subdomain or custom domain). Creates the storefront row when missing. */
export async function storefrontPublicSiteForOwner(
  ownerId: string,
  businessName: string,
): Promise<StorefrontPublicSite> {
  const storefront = await ensureStorefront(ownerId, businessName);
  return {
    storefrontSlug: storefront.slug,
    primaryCustomHostname: await loadPrimaryCustomHostname(storefront.id),
    published: storefront.isPublished,
  };
}

export function storefrontPublicUrl(site: StorefrontPublicSite, path: string): string {
  return getCanonicalStorefrontUrl(
    { slug: site.storefrontSlug, primaryCustomHostname: site.primaryCustomHostname },
    path,
  );
}

/** `https://{sub}.vendl.app/products/{slug}` or `/{category}/{slug}` — same shape as Web Studio. */
export async function productPublicUrl(opts: {
  ownerId: string;
  businessName: string;
  standSlug: string;
  productSlug: string;
  categorySlug?: string | null;
}): Promise<string> {
  try {
    const site = await storefrontPublicSiteForOwner(opts.ownerId, opts.businessName);
    return storefrontPublicUrl(
      site,
      shopProductPath(
        site.storefrontSlug,
        { slug: opts.productSlug, categorySlug: opts.categorySlug },
        false,
        "",
      ),
    );
  } catch (err) {
    console.error("[productPublicUrl] storefront lookup failed", err);
    return `${SITE_URL}${standProductPath(opts.standSlug, opts.productSlug)}`;
  }
}

/** Shop catalogue home on the owner's public host. */
export async function shopPublicUrl(ownerId: string, businessName: string): Promise<string | null> {
  try {
    const site = await storefrontPublicSiteForOwner(ownerId, businessName);
    return storefrontPublicUrl(site, shopPagePath(site.storefrontSlug, "shop", false, ""));
  } catch (err) {
    console.error("[shopPublicUrl] storefront lookup failed", err);
    return null;
  }
}

/** Resolve a stand's owner shop host for dashboard "view on site" links. */
export async function storefrontPublicSiteForStand(
  standSlug: string,
): Promise<StorefrontPublicSite | null> {
  const stand = await prisma.stand.findUnique({
    where: { slug: standSlug.trim().toLowerCase() },
    select: {
      isActive: true,
      name: true,
      ownerId: true,
      owner: { select: { businessName: true } },
    },
  });
  if (!stand?.isActive) return null;
  return storefrontPublicSiteForOwner(
    stand.ownerId,
    stand.owner.businessName || stand.name,
  );
}
