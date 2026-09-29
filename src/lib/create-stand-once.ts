import { prisma } from "@/lib/prisma";
import type { Prisma, Stand } from "@/generated/prisma/client";

const DUPLICATE_WINDOW_MS = 60_000;

/**
 * Create a stand unless the owner created one with the same name moments ago
 * (repeat clicks / resubmitted POSTs). Returns the existing stand in that case.
 */
export async function createStandOnce(
  data: Prisma.StandUncheckedCreateInput,
): Promise<Stand> {
  return prisma.$transaction(async (tx) => {
    // Serialize concurrent creates for this owner so the check below can't race.
    await tx.$queryRaw`SELECT 1 FROM "Owner" WHERE id = ${data.ownerId} FOR UPDATE`;
    const recent = await tx.stand.findFirst({
      where: {
        ownerId: data.ownerId,
        name: data.name,
        createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
      },
      orderBy: { createdAt: "asc" },
    });
    if (recent) return recent;
    return tx.stand.create({ data });
  });
}
