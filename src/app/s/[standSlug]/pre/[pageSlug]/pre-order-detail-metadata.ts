import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatCollectionLabel } from "@/lib/pre-order";
import { preOrderPageMetadata } from "@/lib/stand-seo";

export async function preOrderDetailMetadata(
  standSlug: string,
  pageSlug: string,
): Promise<Metadata> {
  const standKey = decodeURIComponent(standSlug).trim().toLowerCase();
  const pageKey = decodeURIComponent(pageSlug).trim().toLowerCase();
  const page = await prisma.preOrderPage.findFirst({
    where: {
      slug: pageKey,
      isActive: true,
      stand: { slug: standKey, isActive: true },
    },
    include: {
      stand: {
        select: {
          name: true,
          slug: true,
          timezone: true,
          logoUrl: true,
          ogImageUrl: true,
        },
      },
    },
  });
  if (!page) return { title: "Pre-order" };
  return preOrderPageMetadata({
    standName: page.stand.name,
    standSlug: page.stand.slug,
    pageTitle: page.title,
    pageSlug: page.slug,
    description: page.description,
    imageUrl: page.imageUrl,
    collectionLabel: formatCollectionLabel(
      page.collectionAt,
      page.stand.timezone,
    ),
    logoUrl: page.stand.logoUrl,
    ogImageUrl: page.stand.ogImageUrl,
  });
}
