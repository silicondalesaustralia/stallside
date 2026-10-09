import { prisma } from "@/lib/prisma";
import {
  FulfilmentOptionKind,
  type FulfilmentOption,
  type PickupLocation,
  type PickupWindow,
  type DeliveryZone,
} from "@/generated/prisma/client";

export type ShopFulfilmentOption = FulfilmentOption & {
  pickupLocation: Pick<PickupLocation, "publicLabel" | "suburb"> | null;
  pickupWindow: Pick<
    PickupWindow,
    | "recurrence"
    | "label"
    | "weekday"
    | "startTimeMin"
    | "endTimeMin"
    | "startsAt"
    | "endsAt"
  > | null;
  deliveryZone: Pick<
    DeliveryZone,
    "name" | "deliveryFeeCents" | "minOrderCents"
  > | null;
};

/** Online pickup / delivery options shown on the shop storefront. */
export async function loadOnlineFulfilmentOptions(
  ownerId: string,
): Promise<ShopFulfilmentOption[]> {
  return prisma.fulfilmentOption.findMany({
    where: {
      ownerId,
      isActive: true,
      channels: { has: "ONLINE" },
      kind: { in: [FulfilmentOptionKind.PICKUP, FulfilmentOptionKind.DELIVERY] },
    },
    include: {
      pickupLocation: { select: { publicLabel: true, suburb: true } },
      pickupWindow: {
        select: {
          recurrence: true,
          label: true,
          weekday: true,
          startTimeMin: true,
          endTimeMin: true,
          startsAt: true,
          endsAt: true,
        },
      },
      deliveryZone: {
        select: { name: true, deliveryFeeCents: true, minOrderCents: true },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });
}
