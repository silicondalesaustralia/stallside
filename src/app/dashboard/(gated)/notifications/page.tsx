import AlertSettingsForm from "@/app/dashboard/(gated)/settings/AlertSettingsForm";
import { requireOwner } from "@/lib/session";

export default async function NotificationsPage() {
  const { owner } = await requireOwner();

  return (
    <main className="flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Notifications</h1>
        <p className="mt-1 text-[var(--muted)]">
          Sales and low-stock alerts for your account (all businesses). Low-stock
          phone push uses a 6-hour cooldown per product. On iPhone, open Vendl
          from the Home Screen icon, then tap Enable phone alerts and Allow.
        </p>
      </div>
      <AlertSettingsForm
        contactEmail={owner.contactEmail}
        emailAlertsEnabled={owner.emailAlertsEnabled}
        pushAlertsEnabled={owner.pushAlertsEnabled}
        alertEmails={owner.alertEmails}
      />
    </main>
  );
}
