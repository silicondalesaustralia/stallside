"use client";

import { useState, useTransition } from "react";
import { syncPastOrderGst } from "./gst-actions";

export default function GstSyncButton() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSync() {
    setMessage(null);
    startTransition(async () => {
      const result = await syncPastOrderGst();
      setMessage(result.message);
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSync}
          disabled={pending}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold hover:bg-[var(--wash)] disabled:opacity-50"
        >
          {pending ? "Syncing…" : "Sync"}
        </button>
        {message ? (
          <p className="text-sm text-[var(--muted)]">{message}</p>
        ) : null}
      </div>
      <p className="text-xs text-[var(--muted)]">
        New orders get GST automatically. Sync updates past orders after you
        change your GST registration or mark products GST-free.
      </p>
    </div>
  );
}
