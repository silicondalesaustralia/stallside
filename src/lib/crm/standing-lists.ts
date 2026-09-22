import { prisma } from "@/lib/prisma";
import { rulesToJson } from "@/lib/crm/segments";
import type { StandingListPresetKey } from "@/lib/crm/segment-rules";

const STANDING: Record<
  StandingListPresetKey,
  { name: string; description: string }
> = {
  restock: {
    name: "Restock alerts",
    description:
      "Customers who asked to be told when you restock. Grows automatically as people opt in.",
  },
};

/** Ensure Communication standing lists exist; members resolve live from rules. */
export async function ensureStandingLists(ownerId: string) {
  for (const [presetKey, meta] of Object.entries(STANDING) as [
    StandingListPresetKey,
    (typeof STANDING)[StandingListPresetKey],
  ][]) {
    const existing = await prisma.customerSegment.findFirst({
      where: { ownerId, presetKey },
      select: { id: true, isActive: true },
    });
    if (existing) {
      if (!existing.isActive) {
        await prisma.customerSegment.update({
          where: { id: existing.id },
          data: { isActive: true },
        });
      }
      continue;
    }
    await prisma.customerSegment.create({
      data: {
        ownerId,
        name: meta.name,
        description: meta.description,
        presetKey,
        rules: rulesToJson({
          hasRestockInterest: true,
          requireEmail: true,
        }),
      },
    });
  }
}
