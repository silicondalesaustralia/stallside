"use client";

import { useState, useTransition } from "react";
import { deleteStand } from "../actions";

export default function StandDeleteButton({
  standId,
  standName,
}: {
  standId: string;
  standName: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onDelete() {
    const ok = window.confirm(
      `Delete “${standName}”? This removes its products, QR link, and order history. This cannot be undone.`,
    );
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteStand(standId);
      if (result && "error" in result && result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-4">
      <h2 className="text-lg font-semibold text-[var(--gone)]">Delete stand</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Remove this site if you created it by mistake. Unlimited stands - delete anytime.
      </p>
      {error ? <p className="mt-2 text-sm text-[var(--gone)]">{error}</p> : null}
      <button
        type="button"
        onClick={onDelete}
        disabled={pending}
        className="mt-4 rounded-lg border border-[var(--gone)] px-4 py-2.5 text-sm font-semibold text-[var(--gone)] hover:bg-[var(--gone)]/5 disabled:opacity-60"
      >
        {pending ? "Deleting…" : "Delete this stand"}
      </button>
    </div>
  );
}
