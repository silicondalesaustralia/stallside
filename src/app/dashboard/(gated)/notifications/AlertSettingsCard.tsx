import AlertSettingsForm from "../settings/AlertSettingsForm";
import OpenOnHash from "./OpenOnHash";

type AlertSettingsCardProps = {
  contactEmail: string;
  emailAlertsEnabled: boolean;
  pushAlertsEnabled: boolean;
  alertEmails: string[];
};

export default function AlertSettingsCard(props: AlertSettingsCardProps) {
  const summary = [
    props.emailAlertsEnabled ? "Email on" : "Email off",
    props.pushAlertsEnabled ? "Phone on" : "Phone off",
  ].join(" · ");

  return (
    <details id="alert-settings" className="dash-card mb-6 scroll-mt-24 rounded-2xl p-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <span>
          <span className="font-semibold">Alert settings</span>
          <span className="mt-0.5 block text-sm text-[var(--muted)]">
            Sale, low-stock and sold-out alerts by email and on your phone.
          </span>
        </span>
        <span className="shrink-0 text-sm text-[var(--muted)]">{summary}</span>
      </summary>
      <div className="mt-5 border-t border-[var(--line)] pt-5">
        <AlertSettingsForm {...props} />
      </div>
      <OpenOnHash id="alert-settings" />
    </details>
  );
}
