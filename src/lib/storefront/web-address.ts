import { prisma } from "@/lib/prisma";
import { ensureStorefront, slugifyStorefrontInput, uniqueStorefrontSlug } from "@/lib/catalogue/storefront";
import { syncVendlSubdomainRow } from "@/lib/website/persistence/draft-data";
import { patchSiteConfig } from "@/lib/website/persistence/site-redirect-patch";
import { withSlugAlias } from "@/lib/storefront/slug-alias";
import { storefrontSubdomainHost } from "@/lib/tenancy/public-url";
import { ADDRESS_LOCKED_MESSAGE } from "./web-address-copy";

export type WebAddressPreview = {
  host: string;
  currentHost: string | null;
  /** True when the name's own address is taken and a number was added. */
  adjusted: boolean;
  /** A custom domain is connected, so the address can't follow the name. */
  locked: boolean;
};

/** Custom domain still attached (any state but disconnected), or the older single-field setting. */
export async function customDomainConnected(storefront: { id: string; customDomain: string | null }): Promise<boolean> {
  if (storefront.customDomain) return true;
  const row = await prisma.storefrontDomain.findFirst({
    where: { storefrontId: storefront.id, type: "CUSTOM", status: { not: "DISCONNECTED" } },
    select: { id: true },
  });
  return Boolean(row);
}

function loadStorefront(ownerId: string) {
  return prisma.storefront.findUnique({
    where: { ownerId },
    select: { id: true, slug: true, customDomain: true },
  });
}

export async function previewWebAddress(ownerId: string, name: string): Promise<WebAddressPreview> {
  const storefront = await loadStorefront(ownerId);
  const wanted = slugifyStorefrontInput(name);
  const slug = storefront?.slug === wanted ? wanted : await uniqueStorefrontSlug(wanted, ownerId);
  return {
    host: storefrontSubdomainHost(slug),
    currentHost: storefront ? storefrontSubdomainHost(storefront.slug) : null,
    adjusted: slug !== wanted,
    locked: storefront ? await customDomainConnected(storefront) : false,
  };
}

/**
 * Points the website address at `wanted` (a name or slug). The old address keeps redirecting.
 * Refused while a custom domain is connected.
 */
export async function renameStorefrontSlug(
  ownerId: string,
  wanted: string,
): Promise<{ ok: true; slug: string } | { error: string }> {
  const storefront = await loadStorefront(ownerId);
  if (!storefront) return { error: "Website not found." };
  const clean = slugifyStorefrontInput(wanted);
  if (clean === storefront.slug) return { ok: true, slug: clean };
  if (await customDomainConnected(storefront)) return { error: ADDRESS_LOCKED_MESSAGE };

  const slug = await uniqueStorefrontSlug(clean, ownerId);
  if (slug === storefront.slug) return { ok: true, slug };
  await prisma.storefront.update({ where: { id: storefront.id }, data: { slug } });
  await syncVendlSubdomainRow(ownerId);
  try {
    await patchSiteConfig(ownerId, (raw) => withSlugAlias(raw, storefront.slug, slug));
  } catch (err) {
    console.error("renameStorefrontSlug: old address alias not saved", err);
  }
  return { ok: true, slug };
}

/** Creates the (unpublished) website for a new business name, or moves its address to match. */
export async function syncWebAddressToName(
  ownerId: string,
  name: string,
): Promise<{ ok: true; slug: string } | { error: string }> {
  const existing = await loadStorefront(ownerId);
  if (!existing) {
    const created = await ensureStorefront(ownerId, name);
    return { ok: true, slug: created.slug };
  }
  return renameStorefrontSlug(ownerId, name);
}
