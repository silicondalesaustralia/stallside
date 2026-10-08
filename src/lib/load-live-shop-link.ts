import { prisma } from "@/lib/prisma";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";
import { resolveStandQrLinkMode, standQrTargetUrl } from "@/lib/stand-qr";

export type LiveShopLink = { url: string; live: boolean };

/** Public link to the business's main shop page: the same place its QR code opens. */
export async function loadLiveShopLink(
  ownerId: string,
  standId: string,
): Promise<LiveShopLink | null> {
  try {
    const [stand, storefront] = await Promise.all([
      prisma.stand.findFirst({
        where: { id: standId, ownerId },
        select: {
          slug: true,
          isActive: true,
          cartMode: true,
          qrLinkMode: true,
          qrCategory: { select: { slug: true } },
        },
      }),
      prisma.storefront.findUnique({
        where: { ownerId },
        select: { id: true, slug: true },
      }),
    ]);
    if (!stand) return null;
    const primaryCustomHostname = storefront
      ? await loadPrimaryCustomHostname(storefront.id)
      : null;
    const url = standQrTargetUrl({
      linkMode: resolveStandQrLinkMode({
        linkMode: stand.qrLinkMode,
        cartMode: stand.cartMode,
        storefrontSlug: storefront?.slug,
      }),
      standSlug: stand.slug,
      cartMode: stand.cartMode,
      storefrontSlug: storefront?.slug,
      categorySlug: stand.qrCategory?.slug,
      primaryCustomHostname,
    });
    return { url, live: stand.isActive };
  } catch (error) {
    console.error("Live shop link failed", error);
    return null;
  }
}
