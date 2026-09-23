import { ShopperSubStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

/** Statuses that hold a membership spot toward maxMembers. */
export const CAPACITY_HOLDING_STATUSES: ShopperSubStatus[] = [
  ShopperSubStatus.ACTIVE,
  ShopperSubStatus.PAST_DUE,
  ShopperSubStatus.PAUSED,
];

/** Incomplete checkouts newer than this still reserve a spot. */
const INCOMPLETE_HOLD_MS = 3 * 60 * 60 * 1000;

export async function countHoldingMembers(
  offerId: string,
  now = new Date(),
): Promise<number> {
  const incompleteSince = new Date(now.getTime() - INCOMPLETE_HOLD_MS);
  return prisma.shopperSubscription.count({
    where: {
      offerId,
      OR: [
        { status: { in: CAPACITY_HOLDING_STATUSES } },
        {
          status: ShopperSubStatus.INCOMPLETE,
          createdAt: { gte: incompleteSince },
        },
      ],
    },
  });
}

export function isOfferAtCapacity(
  maxMembers: number | null | undefined,
  holdingCount: number,
): boolean {
  if (maxMembers == null || maxMembers < 1) return false;
  return holdingCount >= maxMembers;
}

export function spotsLeft(
  maxMembers: number | null | undefined,
  holdingCount: number,
): number | null {
  if (maxMembers == null || maxMembers < 1) return null;
  return Math.max(0, maxMembers - holdingCount);
}

/** Parse optional max-members field; blank = unlimited. */
export function parseMaxMembers(
  raw: FormDataEntryValue | null,
): number | null | { error: string } {
  const text = String(raw ?? "").trim();
  if (!text) return null;
  const n = Number.parseInt(text, 10);
  if (!Number.isFinite(n) || n < 1 || n > 9999) {
    return {
      error: "Max members must be between 1 and 9999, or blank for unlimited.",
    };
  }
  return n;
}
