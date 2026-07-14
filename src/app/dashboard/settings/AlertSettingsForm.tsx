"use client";

import { useState, useTransition } from "react";
import { updateAlertSettings } from "./actions";

type AlertSettingsFormProps = {
  contactEmail: string;
  emailAlertsEnabled: boolean;
  pushAlertsEnabled: boolean;
  alertEmails: string[];
};

export default function AlertSettingsForm({
  contactEmail,
  emailAlertsEnabled,
  pushAlertsEnabled,
  alertEmails,
}: AlertSettingsFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateAlertSettings(formData);
      if (result && "error" in result && result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Alert settings saved.");
    });
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4 text-sm">
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          name="emailAlertsEnabled"
          defaultChecked={emailAlertsEnabled}
          className="mt-1 size-4 accent-[var(--leaf)]"
        />
        <span>
          <span className="font-medium">Email alerts</span>
          <span className="mt-0.5 block text-[var(--muted)]">
            Sales, low stock, sold out, and Tap &amp; Go interest emails. Default on.
          </span>
        </span>
      </label>
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          name="pushAlertsEnabled"
          defaultChecked={pushAlertsEnabled}
          className="mt-1 size-4 accent-[var(--leaf)]"
        />
        <span>
          <span className="font-medium">App alerts</span>
          <span className="mt-0.5 block text-[var(--muted)]">
            Push notifications on the Stallside phone app. Default on.
          </span>
        </span>
      </label>

      <div>
        <p className="font-medium">Alert emails</p>
        <p className="mt-1 text-[var(--muted)]">
          Always includes <strong>{contactEmail}</strong>. Add more below (one per
          line or comma-separated).
        </p>
        <textarea
          name="alertEmails"
          rows={3}
          defaultValue={alertEmails.join("\n")}
          placeholder="partner@example.com"
          className="mt-2 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </div>

      {message ? <p className="text-[var(--muted)]">{message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save alert settings"}
      </button>
    </form>
  );
}
