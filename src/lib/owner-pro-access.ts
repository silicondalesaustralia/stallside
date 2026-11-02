import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { ownerHasProAccess } from "@/lib/owner-trial";

/** Pro access by owner id: paid Pro, lifetime, or complimentary (admins, allowlisted emails). */
export const ownerIdHasProAccess = cache(async (ownerId: string): Promise<boolean> => {
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

/** Pro access for a signed-in user; false when they have no business yet. */
export async function userIdHasProAccess(userId: string): Promise<boolean> {
  const owner = await prisma.owner.findUnique({ where: { userId }, select: { id: true } });
  return owner ? ownerIdHasProAccess(owner.id) : false;
}
