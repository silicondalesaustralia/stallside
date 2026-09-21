import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const standSelect = {
  id: true,
  name: true,
  slug: true,
  currency: true,
  ownerId: true,
  timezone: true,
} as const;

/** Active supplier membership. Every supplier write must call this. */
export const requireSupplier = cache(async (standId?: string | null) => {
  const user = await requireUser();
  const memberships = await prisma.standMember.findMany({
    where: { userId: user.id, status: "ACTIVE" },
    include: { stand: { select: standSelect } },
    orderBy: { createdAt: "asc" },
  });
  if (!memberships.length) redirect("/dashboard");

  const membership = standId
    ? memberships.find((row) => row.standId === standId)
    : memberships[0];
  if (!membership) redirect("/supply");

  const owner = await prisma.owner.findUnique({
    where: { userId: user.id },
    select: { id: true, deletedAt: true },
  });
  const hasOwnStand = Boolean(owner && !owner.deletedAt);

  return { user, membership, memberships, hasOwnStand };
});
