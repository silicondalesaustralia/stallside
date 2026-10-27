import { requireOwner } from "@/lib/session";
import { listOwnerNotifications } from "@/lib/notifications/service";
import NotificationsList from "./NotificationsList";
import NotificationsHeader from "./NotificationsHeader";
import AlertSettingsCard from "./AlertSettingsCard";

export default async function NotificationsPage() {
  const { owner } = await requireOwner();

  const notifications = await listOwnerNotifications(owner.id);

  const openCount = notifications.filter((n) => n.status === "OPEN").length;

  return (
    <div className="mx-auto max-w-4xl">
      <NotificationsHeader unreadCount={openCount} />
      <AlertSettingsCard
        contactEmail={owner.contactEmail}
        emailAlertsEnabled={owner.emailAlertsEnabled}
        pushAlertsEnabled={owner.pushAlertsEnabled}
        alertEmails={owner.alertEmails}
      />

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
