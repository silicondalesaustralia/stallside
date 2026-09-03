import { prisma } from "@/lib/prisma";
import {
  FulfilmentOptionKind,
  MenuKind,
  PickupWindowRecurrence,
} from "@/generated/prisma/client";
import { scheduleFromMenu } from "@/lib/menu-schedule";

/** Upsert FulfilmentOption + PickupWindow from a PREORDER_DROP menu. */
export async function syncMenuFulfilmentOption(menuId: string) {
  const menu = await prisma.menu.findUnique({
    where: { id: menuId },
    include: { stand: { select: { timezone: true } } },
  });
  if (!menu || menu.kind !== MenuKind.PREORDER_DROP) return null;

  const schedule = scheduleFromMenu(menu);
  if (!schedule) return null;

  const existing = await prisma.fulfilmentOption.findFirst({
    where: { menuId: menu.id },
    include: { pickupWindow: true },
  });

  const channels = [
    ...(menu.showOnStand ? ["STAND"] : []),
    ...(menu.showOnShop ? ["ONLINE"] : []),
  ];

  const windowData = {
    ownerId: menu.ownerId,
    label: menu.title,
    timezone: menu.stand.timezone,
    recurrence: PickupWindowRecurrence.ONE_OFF,
    startsAt: schedule.collectionAt,
    endsAt: schedule.collectionAt,
    orderOpensAt: null as Date | null,
    orderClosesAt: schedule.orderByAt,
    isActive: menu.isActive,
  };

  let windowId = existing?.pickupWindowId ?? null;
  if (windowId) {
    await prisma.pickupWindow.update({
      where: { id: windowId },
      data: windowData,
    });
  } else {
    const win = await prisma.pickupWindow.create({ data: windowData });
    windowId = win.id;
  }

  const optionData = {
    ownerId: menu.ownerId,
    kind: FulfilmentOptionKind.MENU_SHEET,
    label: menu.title,
    standId: menu.standId,
    pickupWindowId: windowId,
    menuId: menu.id,
    handoverMode: schedule.handoverMode,
    paymentTiming: schedule.paymentTiming,
    depositPercent: schedule.depositPercent,
    channels: channels.length > 0 ? channels : ["STAND"],
    isActive: menu.isActive,
  };

  if (existing) {
    return prisma.fulfilmentOption.update({
      where: { id: existing.id },
      data: optionData,
    });
  }

  return prisma.fulfilmentOption.create({ data: optionData });
}
