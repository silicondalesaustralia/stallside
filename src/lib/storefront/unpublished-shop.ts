import { prisma } from "@/lib/prisma";

/** Business name when the shop exists but its website has never been published. */
export async function unpublishedShopName(slug: string): Promise<string | null> {
  const key = decodeURIComponent(slug).trim().toLowerCase();
  const storefront = await prisma.storefront.findFirst({
    where: { slug: key },
    select: { isPublished: true, headline: true, owner: { select: { businessName: true } } },
  });
  if (!storefront || storefront.isPublished) return null;
  return storefront.headline?.trim() || storefront.owner.businessName;
}
