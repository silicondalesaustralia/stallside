import { prisma } from "@/lib/prisma";
import { pickWebsiteStand } from "./website-stand";

/** Id of the stand that powers the owner's website, or null when they have no stands. */
export async function websiteStandIdForOwner(ownerId: string): Promise<string | null> {
  const [storefront, stands] = await Promise.all([
    prisma.storefront.findUnique({ where: { ownerId }, select: { draftConfig: true } }),
    prisma.stand.findMany({ where: { ownerId }, orderBy: { createdAt: "asc" }, select: { id: true } }),
  ]);
  return pickWebsiteStand(stands, storefront?.draftConfig)?.id ?? null;
}
