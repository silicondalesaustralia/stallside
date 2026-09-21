import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma/client";

type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
};

/** New login for an invited supplier: user only, no stand of their own. */
export async function claimSupplierInvite(email: string): Promise<AuthUser | null> {
  const invite = await prisma.standMember.findFirst({
    where: { email, status: "INVITED" },
    select: { name: true },
  });
  if (!invite) return null;

  const user = await prisma.user.create({
    data: {
      email,
      name: invite.name,
      emailVerified: new Date(),
    },
  });
  await prisma.standMember.updateMany({
    where: { email, status: "INVITED" },
    data: { userId: user.id, status: "ACTIVE" },
  });
  await prisma.signupIntent.delete({ where: { email } }).catch(() => null);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function hasSupplierSeat(email: string) {
  const seat = await prisma.standMember.findFirst({
    where: { email, status: { in: ["INVITED", "ACTIVE"] } },
    select: { id: true },
  });
  return Boolean(seat);
}
