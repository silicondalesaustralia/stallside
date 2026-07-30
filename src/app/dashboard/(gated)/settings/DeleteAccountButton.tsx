"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "./delete-account-actions";

const DELETES = [
  "Your Stallside subscription is cancelled immediately (if you have one)",
  "All emails and phone push alerts stop",
  "Every stand, product, QR link, and order history is permanently removed",
  "Your login and account details are deleted",
] as const;

export default function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await deleteAccount();
      if (result && "error" in result && result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="rounded-[var(--radius)] border border-[var(--gone)]/40 bg-[var(--panel)] p-4">
      <h3 className="text-base font-semibold text-[var(--gone)]">Delete account</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Permanently close your Stallside account. This cannot be undone.
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setError(null);
          }}
          className="mt-3 rounded-lg border border-[var(--gone)] px-4 py-2.5 text-sm font-semibold text-[var(--gone)] hover:bg-[var(--gone)]/5"
        >
          Delete account
        </button>
      ) : (
        <div className="mt-3 space-y-3 rounded-lg border border-[var(--gone)]/30 bg-[var(--gone)]/5 p-3">
          <p className="text-sm font-semibold text-[var(--gone)]">
            If you continue, the following will happen:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-[var(--ink)]">
            {DELETES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="text-sm font-medium text-[var(--gone)]">
            This cannot be undone.
          </p>
          {error ? <p className="text-sm text-[var(--gone)]">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={onConfirm}
              className="rounded-lg bg-[var(--gone)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Deleting…" : "Yes, delete my account"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setOpen(false)}
              className="rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
