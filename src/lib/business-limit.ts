import { prisma } from "@/lib/prisma";
import { isPlatformAdminEmail } from "@/lib/session";

/** One business per account; platform admins keep demo and test businesses. */
export function mayAddBusiness(email: string | null | undefined, existingCount: number): boolean {
  return existingCount === 0 || isPlatformAdminEmail(email);
}

/** The owner's first business when they've hit the limit, else null. */
export async function businessLimitReached(
  ownerId: string,
  email: string | null | undefined,
): Promise<{ id: string } | null> {
  if (isPlatformAdminEmail(email)) return null;
  return prisma.stand.findFirst({
    where: { ownerId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
}
