import type { Prisma } from "@/generated/prisma/client";
import { ProductChannelType } from "@/generated/prisma/client";

/** Products visible on a stand via legacy standId OR ProductChannel. */
export function productOnStandWhere(
  standId: string,
): Prisma.ProductWhereInput {
  return {
    OR: [
      { standId },
      {
        channels: {
          some: {
            isEnabled: true,
            standId,
            channelType: {
              in: [ProductChannelType.STAND, ProductChannelType.ONLINE],
            },
          },
        },
      },
    ],
  };
}

export function productIdsOnStandWhere(
  standId: string,
  productIds: string[],
): Prisma.ProductWhereInput {
  return {
    id: { in: productIds },
    ...productOnStandWhere(standId),
  };
}
