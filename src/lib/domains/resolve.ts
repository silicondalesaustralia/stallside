import { prisma } from "@/lib/prisma";
import { normalizeDomainHostname } from "./normalize";
import { StorefrontDomainStatus } from "@/generated/prisma/client";

export type ResolvedStorefrontHost = {
  storefrontId: string;
  slug: string;
  hostname: string;
  isPrimary: boolean;
  type: "VENDL_SUBDOMAIN" | "CUSTOM";
};

/** Look up an ACTIVE custom hostname → storefront slug. */
export async function resolveActiveCustomHostname(
  hostname: string,
): Promise<ResolvedStorefrontHost | null> {
  const host = normalizeDomainHostname(hostname);
  if (!host) return null;

  const row = await prisma.storefrontDomain.findFirst({
    where: {
      hostname: host,
      type: "CUSTOM",
      status: StorefrontDomainStatus.ACTIVE,
      storefront: { isPublished: true },
    },
    select: {
      hostname: true,
      isPrimary: true,
      type: true,
      storefrontId: true,
      storefront: { select: { slug: true } },
    },
  });

  if (!row) return null;
  return {
    storefrontId: row.storefrontId,
    slug: row.storefront.slug,
    hostname: row.hostname,
    isPrimary: row.isPrimary,
    type: "CUSTOM",
  };
}

export async function loadPrimaryCustomHostname(
  storefrontId: string,
): Promise<string | null> {
  const row = await prisma.storefrontDomain.findFirst({
    where: {
      storefrontId,
      type: "CUSTOM",
      status: StorefrontDomainStatus.ACTIVE,
      isPrimary: true,
    },
    select: { hostname: true },
  });
  return row?.hostname ?? null;
}

export async function loadPreferredOriginInput(storefront: {
  id: string;
  slug: string;
}): Promise<{ slug: string; primaryCustomHostname: string | null }> {
  const primaryCustomHostname = await loadPrimaryCustomHostname(storefront.id);
  return { slug: storefront.slug, primaryCustomHostname };
}
