"use server";

import { prisma } from "@/lib/prisma";
import { requireOwnerWrite } from "@/lib/session";
import { revalidatePath } from "next/cache";
import type { NotificationStatus } from "@/generated/prisma/client";

function revalidateNotifications() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");
}

export async function markNotificationRead(notificationId: string) {
  const { owner } = await requireOwnerWrite();

  await prisma.notification.updateMany({
    where: { id: notificationId, ownerId: owner.id },
    data: { isRead: true, readAt: new Date() },
  });

  revalidateNotifications();
  return { ok: true as const };
}

export async function markAllNotificationsRead() {
  const { owner } = await requireOwnerWrite();

  await prisma.notification.updateMany({
    where: { ownerId: owner.id, status: "OPEN" },
    data: { status: "CLOSED", isRead: true, readAt: new Date() },
  });

  revalidateNotifications();
  return { ok: true as const };
}

export async function setNotificationStatus(
  notificationId: string,
  status: NotificationStatus,
) {
  const { owner } = await requireOwnerWrite();
  if (status !== "OPEN" && status !== "ACTIONED" && status !== "CLOSED") {
    return { error: "Invalid status." as const };
  }

  await prisma.notification.updateMany({
    where: { id: notificationId, ownerId: owner.id },
    data:
      status === "OPEN"
        ? { status, isRead: false, readAt: null }
        : { status, isRead: true, readAt: new Date() },
  });

  revalidateNotifications();
  return { ok: true as const };
}

export async function deleteNotification(notificationId: string) {
  const { owner } = await requireOwnerWrite();

  await prisma.notification.deleteMany({
    where: { id: notificationId, ownerId: owner.id },
  });

  revalidateNotifications();
  return { ok: true as const };
}
