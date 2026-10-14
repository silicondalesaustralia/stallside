import { appBaseUrl } from "@/lib/app-url";
import { prisma } from "@/lib/prisma";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";
import { standQrTargetUrl } from "@/lib/stand-qr";

/**
 * Permanent address printed in new QR codes. The destination is worked out on every
 * scan, so posters keep working through publishing, domain changes and renames.
 */
export function qrShortUrl(qrId: string): string {
  return `${appBaseUrl()}/q/${encodeURIComponent(qrId)}`;
}

/** Current destination for a saved QR code, or null when it no longer exists. */
export async function resolveQrTarget(qrId: string): Promise<string | null> {
  const qr = await prisma.qrCode.findUnique({
    where: { id: qrId },
    select: {
      ownerId: true,
      linkMode: true,
      category: { select: { slug: true, isActive: true } },
      stand: { select: { slug: true, cartMode: true } },
    },
  });
  if (!qr) return null;
  const storefront = await prisma.storefront.findUnique({
    where: { ownerId: qr.ownerId },
    select: { id: true, slug: true, isPublished: true },
  });
  const live = storefront?.isPublished ? storefront : null;
  return standQrTargetUrl({
    linkMode: qr.linkMode,
    standSlug: qr.stand.slug,
    cartMode: qr.stand.cartMode,
    storefrontSlug: live?.slug,
    categorySlug: qr.category?.isActive ? qr.category.slug : null,
    primaryCustomHostname: live ? await loadPrimaryCustomHostname(live.id) : null,
  });
}
