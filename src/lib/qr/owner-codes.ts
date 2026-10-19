import { prisma } from "@/lib/prisma";
import { qrShortUrl } from "@/lib/qr-short-link";
import { standCheckoutUrl } from "@/lib/stand-qr";
import { listQrTargets } from "./targets";
import { legacyQrTarget, parseQrTarget, qrTargetKey } from "./target-types";

export type OwnerQrCode = {
  id: string;
  name: string;
  standName: string;
  /** Null when the page it opened has been removed (scans then open the website home). */
  destination: { label: string; path: string } | null;
  atStall: boolean;
  /** What the printed code encodes. */
  url: string;
};

/** Saved "QR codes for pages", newest first, with where each one currently opens. */
export async function listOwnerQrCodes(ownerId: string): Promise<OwnerQrCode[]> {
  const [qrCodes, options] = await Promise.all([
    prisma.qrCode.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        linkMode: true,
        categoryId: true,
        targetKind: true,
        targetId: true,
        atStall: true,
        stand: { select: { name: true } },
      },
    }),
    listQrTargets(ownerId),
  ]);
  const byKey = new Map(options.map((o) => [qrTargetKey(o), o]));
  return qrCodes.map((qr) => {
    const target = parseQrTarget(qr.targetKind, qr.targetId) ?? legacyQrTarget(qr.linkMode, qr.categoryId);
    const option = byKey.get(qrTargetKey(target));
    return {
      id: qr.id,
      name: qr.name,
      standName: qr.stand.name,
      destination: option ? { label: option.label, path: option.path } : null,
      atStall: qr.atStall,
      url: qrShortUrl(qr.id),
    };
  });
}

/** One saved QR code's name and encoded link. */
export async function getOwnerQrCode(ownerId: string, qrId: string) {
  const qr = await prisma.qrCode.findFirst({
    where: { id: qrId, ownerId },
    select: { id: true, name: true, stand: { select: { name: true } } },
  });
  return qr ? { id: qr.id, name: qr.name, standName: qr.stand.name, url: qrShortUrl(qr.id) } : null;
}

/** The business's main QR, which opens its shop checkout. */
export async function getOwnerBusinessQr(ownerId: string, standId: string) {
  const stand = await prisma.stand.findFirst({
    where: { id: standId, ownerId },
    select: { id: true, name: true, slug: true, cartMode: true },
  });
  return stand ? { id: stand.id, name: stand.name, url: standCheckoutUrl(stand.slug, stand.cartMode) } : null;
}
