import { prisma } from "@/lib/prisma";
import type { Prisma, Stand } from "@/generated/prisma/client";

const DUPLICATE_WINDOW_MS = 60_000;

/**
 * Create a stand unless the owner created one with the same name moments ago
 * (repeat clicks / resubmitted POSTs). Returns the existing stand in that case.
 * Without `allowMultiple`, an owner who already has a stand gets their first one back
 * (`limited: true`) instead of a new one.
 */
export async function createStandOnce(
  data: Prisma.StandUncheckedCreateInput,
  options: { allowMultiple: boolean },
): Promise<{ stand: Stand; limited: boolean }> {
  return prisma.$transaction(async (tx) => {
    // Serialize concurrent creates for this owner so the checks below can't race.
    await tx.$queryRaw`SELECT 1 FROM "Owner" WHERE id = ${data.ownerId} FOR UPDATE`;
    const recent = await tx.stand.findFirst({
      where: {
        ownerId: data.ownerId,
        name: data.name,
        createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
      },
      orderBy: { createdAt: "asc" },
    });
    if (recent) return { stand: recent, limited: false };
    if (!options.allowMultiple) {
      const first = await tx.stand.findFirst({
        where: { ownerId: data.ownerId },
        orderBy: { createdAt: "asc" },
      });
      if (first) return { stand: first, limited: true };
    }
    return { stand: await tx.stand.create({ data }), limited: false };
  });
}
