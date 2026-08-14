import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/session";
import NotificationsList from "./NotificationsList";
import NotificationsHeader from "./NotificationsHeader";

export default async function NotificationsPage() {
  const { owner } = await requireOwner();

  const notifications = await prisma.notification.findMany({
    where: { ownerId: owner.id },
    include: { stand: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  const openCount = notifications.filter((n) => n.status === "OPEN").length;

  return (
    <div className="mx-auto max-w-4xl">
      <NotificationsHeader unreadCount={openCount} />

      {notifications.length === 0 ? (
        <div className="dash-card rounded-2xl p-8 text-center">
          <p className="text-[var(--muted)]">No notifications yet.</p>
        </div>
      ) : (
        <NotificationsList notifications={notifications} />
      )}
    </div>
  );
}
