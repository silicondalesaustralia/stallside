"use server";

import { requireOwnerWrite } from "@/lib/session";
import type { NotificationStatus } from "@/generated/prisma/client";
import {
  NOTIFICATION_STATUSES,
  closeAllOwnerNotifications,
  deleteOwnerNotification,
  markOwnerNotificationRead,
  setOwnerNotificationStatus,
} from "@/lib/notifications/service";

export async function markNotificationRead(notificationId: string) {
  const { owner } = await requireOwnerWrite();
  await markOwnerNotificationRead(owner.id, notificationId);
  return { ok: true as const };
}

export async function markAllNotificationsRead() {
  const { owner } = await requireOwnerWrite();
  await closeAllOwnerNotifications(owner.id);
  return { ok: true as const };
}

export async function setNotificationStatus(
  notificationId: string,
  status: NotificationStatus,
) {
  const { owner } = await requireOwnerWrite();
  if (!NOTIFICATION_STATUSES.includes(status)) {
    return { error: "Invalid status." as const };
  }
  await setOwnerNotificationStatus(owner.id, notificationId, status);
  return { ok: true as const };
}

export async function deleteNotification(notificationId: string) {
  const { owner } = await requireOwnerWrite();
  await deleteOwnerNotification(owner.id, notificationId);
  return { ok: true as const };
}
