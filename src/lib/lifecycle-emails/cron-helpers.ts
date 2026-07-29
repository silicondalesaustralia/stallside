import { prisma } from "@/lib/prisma";

export function daysAgo(days: number, from = new Date()): Date {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

export function recipient(owner: {
  contactEmail: string;
  businessName: string;
  user: { email: string | null; name: string | null } | null;
}) {
  const to = (owner.user?.email || owner.contactEmail || "").trim();
  if (!to.includes("@")) return null;
  return {
    to,
    name: owner.user?.name || owner.businessName,
    businessName: owner.businessName,
  };
}

export async function markSent(
  ownerId: string,
  field: string,
  now: Date,
): Promise<void> {
  await prisma.owner.update({
    where: { id: ownerId },
    data: { [field]: now },
  });
}
