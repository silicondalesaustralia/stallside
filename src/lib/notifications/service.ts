import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { NotificationStatus } from "@/generated/prisma/client";

export const NOTIFICATION_STATUSES = ["OPEN", "ACTIONED", "CLOSED"] as const satisfies readonly NotificationStatus[];

function revalidateNotifications() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");
}

/** Open ones first, newest first; the same 100 the web inbox shows. */
export function listOwnerNotifications(ownerId: string) {
  return prisma.notification.findMany({
    where: { ownerId },
    include: { stand: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
  });
}

export type OwnerNotification = Awaited<ReturnType<typeof listOwnerNotifications>>[number];

export function countOpenNotifications(ownerId: string) {
  return prisma.notification.count({ where: { ownerId, status: "OPEN" } });
}

export async function markOwnerNotificationRead(ownerId: string, notificationId: string) {
  await prisma.notification.updateMany({
    where: { id: notificationId, ownerId },
    data: { isRead: true, readAt: new Date() },
  });
  revalidateNotifications();
}

export async function closeAllOwnerNotifications(ownerId: string) {
  await prisma.notification.updateMany({
    where: { ownerId, status: "OPEN" },
    data: { status: "CLOSED", isRead: true, readAt: new Date() },
  });
  revalidateNotifications();
}

/** Returns false when the notification isn't the owner's. */
export async function setOwnerNotificationStatus(
  ownerId: string,
  notificationId: string,
  status: NotificationStatus,
): Promise<boolean> {
  const { count } = await prisma.notification.updateMany({
    where: { id: notificationId, ownerId },
    data:
      status === "OPEN"
        ? { status, isRead: false, readAt: null }
        : { status, isRead: true, readAt: new Date() },
  });
  revalidateNotifications();
  return count > 0;
}

/** Returns false when the notification isn't the owner's. */
export async function deleteOwnerNotification(ownerId: string, notificationId: string): Promise<boolean> {
  const { count } = await prisma.notification.deleteMany({ where: { id: notificationId, ownerId } });
  revalidateNotifications();
  return count > 0;
}
