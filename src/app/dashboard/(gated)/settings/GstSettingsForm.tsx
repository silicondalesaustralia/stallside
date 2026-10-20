"use client";

import { useState, useTransition } from "react";
import { updateGstSettings } from "./gst-actions";

export default function GstSettingsForm({
  abn,
  gstRegistered,
}: {
  abn: string | null;
  gstRegistered: boolean;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateGstSettings(formData);
      setMessage(result.error ?? "GST settings saved.");
    });
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="font-medium">ABN</span>
        <input
          name="abn"
          inputMode="numeric"
          maxLength={14}
          defaultValue={abn ?? ""}
          placeholder="11 digits"
          className="max-w-xs rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--leaf)] focus:ring-2"
        />
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="gstRegistered"
          defaultChecked={gstRegistered}
        />
        <span>Registered for GST (prices include GST)</span>
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--leaf)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {message ? (
          <p className="text-sm text-[var(--muted)]">{message}</p>
        ) : null}
      </div>
    </form>
  );
}
