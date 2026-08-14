"use server";

import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function markNotificationRead(notificationId: string) {
  const { owner } = await requireOwner();

  await prisma.notification.updateMany({
    where: { id: notificationId, ownerId: owner.id },
    data: { isRead: true, readAt: new Date() },
  });

  revalidatePath("/dashboard/notifications");
  return { ok: true as const };
}

export async function markAllNotificationsRead() {
  const { owner } = await requireOwner();

  await prisma.notification.updateMany({
    where: { ownerId: owner.id, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  revalidatePath("/dashboard/notifications");
  return { ok: true as const };
}

export async function deleteNotification(notificationId: string) {
  const { owner } = await requireOwner();

  await prisma.notification.deleteMany({
    where: { id: notificationId, ownerId: owner.id },
  });

  revalidatePath("/dashboard/notifications");
  return { ok: true as const };
}
