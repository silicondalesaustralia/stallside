import { prisma } from "@/lib/prisma";
import { slugify, uniqueStandSlug } from "@/lib/slug";
import { businessPageProductWhere } from "@/lib/product-visibility";
import { listProductsForOnlineShop, primaryStandIdForOwner } from "@/lib/catalogue/channels";

import { SITE_URL } from "@/lib/legal";

export async function uniqueStorefrontSlug(
  base: string,
  excludeOwnerId?: string,
): Promise<string> {
  const exists = async (slug: string) => {
    const hit = await prisma.storefront.findFirst({
      where: {
        slug,
        ...(excludeOwnerId ? { NOT: { ownerId: excludeOwnerId } } : {}),
      },
      select: { id: true },
    });
    if (hit) return true;
    const stand = await prisma.stand.findFirst({
      where: { slug },
      select: { id: true },
    });
    return Boolean(stand);
  };
  return uniqueStandSlug(base, exists);
}

export async function ensureStorefront(ownerId: string, businessName: string) {
  const existing = await prisma.storefront.findUnique({ where: { ownerId } });
  if (existing) return existing;
  const slug = await uniqueStorefrontSlug(businessName || "shop");
  return prisma.storefront.create({
    data: {
      ownerId,
      slug,
      headline: businessName,
      isPublished: false,
    },
  });
}

export async function loadPublishedStorefront(slug: string) {
  const key = decodeURIComponent(slug).trim().toLowerCase();
  const storefront = await prisma.storefront.findFirst({
    where: { slug: key, isPublished: true },
    include: {
      owner: {
        include: {
          user: { select: { email: true, role: true } },
          stands: {
            orderBy: { createdAt: "asc" },
            take: 1,
          },
        },
      },
    },
  });
  if (!storefront?.owner.stands[0]?.isActive) return null;

  const stand = storefront.owner.stands[0];
  const products = await listProductsForOnlineShop(
    storefront.ownerId,
    stand.id,
    businessPageProductWhere,
  );

  return { storefront, stand, products, owner: storefront.owner };
}

export function storefrontPublicPath(slug: string) {
  return `/shop/${encodeURIComponent(slug)}`;
}

export function storefrontFullUrl(slug: string) {
  return `${SITE_URL}${storefrontPublicPath(slug)}`;
}

export function slugifyStorefrontInput(input: string) {
  return slugify(input) || "shop";
}
