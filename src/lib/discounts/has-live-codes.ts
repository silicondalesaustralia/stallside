import { prisma } from "@/lib/prisma";
import type { DiscountChannel } from "./resolve-code";

/** True when the shopper should see a discount code box at this business. */
export async function hasLiveDiscountCodes(
  ownerId: string,
  standId: string,
  channel: DiscountChannel,
): Promise<boolean> {
  const now = new Date();
  const found = await prisma.promotion.findFirst({
    where: {
      ownerId,
      isActive: true,
      OR: [{ standId: null }, { standId }],
      ...(channel === "website" ? { showOnWebsite: true } : { showAtStall: true }),
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    select: { id: true },
  });
  return Boolean(found);
}
