import { prisma } from "@/lib/prisma";
import { CommerceProvider } from "@/generated/prisma/client";

/** Set when a lifetime seller ticked "end my Lifetime plan" before Square OAuth. */
export const SQUARE_LIFETIME_CONFIRM_COOKIE = "square_lifetime_confirm";

/** Any prior Square connection (even disconnected) keeps the seller grandfathered. */
export async function hasSquareConnectionHistory(ownerId: string): Promise<boolean> {
  const count = await prisma.externalCommerceConnection.count({
    where: { ownerId, provider: CommerceProvider.SQUARE },
  });
  return count > 0;
}
