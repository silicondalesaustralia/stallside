import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { ownerHasProAccess } from "@/lib/owner-trial";

/** Tags & Pixels (and server-side conversions) are a Pro feature, like custom domains. */
export const ownerCanUseTagsPixels = cache(async (ownerId: string): Promise<boolean> => {
  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
    include: { user: { select: { email: true, role: true } } },
  });
  if (!owner) return false;
  return ownerHasProAccess(owner, {
    email: owner.user.email,
    role: owner.user.role,
    lifetimeAccess: owner.lifetimeAccess,
  });
});
