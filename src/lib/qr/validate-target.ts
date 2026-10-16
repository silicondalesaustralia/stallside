import { prisma } from "@/lib/prisma";
import { StandQrLinkMode } from "@/generated/prisma/client";
import { ensureCustomPages } from "@/lib/studio/custom-pages";
import { lookupQrTargetPath } from "./target-lookup";
import { parseQrTarget, type QrTarget } from "./target-types";

/** The target when it is valid and belongs to this owner (custom pages may still be drafts). */
export async function validateQrTarget(ownerId: string, kind: unknown, id: unknown): Promise<QrTarget | null> {
  const target = parseQrTarget(kind, id);
  if (!target) return null;
  if (target.kind === "page") {
    const storefront = await prisma.storefront.findUnique({ where: { ownerId }, select: { draftConfig: true } });
    const exists = ensureCustomPages(storefront?.draftConfig ?? {}).some((p) => p.id === target.id);
    return exists ? target : null;
  }
  return (await lookupQrTargetPath(ownerId, target, {})) ? target : null;
}

/** Keeps the older linkMode/categoryId columns in step for code that still reads them. */
export function legacyLinkFields(target: QrTarget): { linkMode: StandQrLinkMode; categoryId: string | null } {
  return target.kind === "category"
    ? { linkMode: StandQrLinkMode.WEBSITE_CATEGORY, categoryId: target.id }
    : { linkMode: StandQrLinkMode.WEBSITE_HOME, categoryId: null };
}
