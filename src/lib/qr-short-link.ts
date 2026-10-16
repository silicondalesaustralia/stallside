import { appBaseUrl } from "@/lib/app-url";
import { prisma } from "@/lib/prisma";
import { CartMode } from "@/generated/prisma/client";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";
import { standCheckoutUrl } from "@/lib/stand-qr";
import { storefrontPublicUrl } from "@/lib/tenancy/public-url";
import { lookupQrTargetPath } from "@/lib/qr/target-lookup";
import { legacyQrTarget, parseQrTarget, withStallFlag } from "@/lib/qr/target-types";

/**
 * Permanent address printed in new QR codes. The destination is worked out on every
 * scan, so posters keep working through publishing, domain changes and renames.
 */
export function qrShortUrl(qrId: string): string {
  return `${appBaseUrl()}/q/${encodeURIComponent(qrId)}`;
}

/**
 * Current destination for a saved QR code, or null when it no longer exists. Without a published
 * website (or for Customer Choice stalls) it opens the stall checkout; a page that has since gone
 * opens the website home rather than an error.
 */
export async function resolveQrTarget(qrId: string): Promise<string | null> {
  const qr = await prisma.qrCode.findUnique({
    where: { id: qrId },
    select: {
      ownerId: true,
      linkMode: true,
      categoryId: true,
      targetKind: true,
      targetId: true,
      atStall: true,
      stand: { select: { slug: true, cartMode: true } },
    },
  });
  if (!qr) return null;
  const storefront = await prisma.storefront.findUnique({
    where: { ownerId: qr.ownerId },
    select: { id: true, slug: true, isPublished: true, publishedConfig: true },
  });
  if (!storefront?.isPublished || qr.stand.cartMode === CartMode.CUSTOMER_CHOICE) {
    return standCheckoutUrl(qr.stand.slug, qr.stand.cartMode);
  }
  const target = parseQrTarget(qr.targetKind, qr.targetId) ?? legacyQrTarget(qr.linkMode, qr.categoryId);
  const path = (await lookupQrTargetPath(qr.ownerId, target, storefront.publishedConfig)) ?? "/";
  const url = storefrontPublicUrl(storefront.slug, {
    path,
    primaryCustomHostname: await loadPrimaryCustomHostname(storefront.id),
  });
  return qr.atStall ? withStallFlag(url) : url;
}
