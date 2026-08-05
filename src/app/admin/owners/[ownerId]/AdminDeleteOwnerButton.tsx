"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { adminDeleteOwner } from "./actions";

const DELETES = [
  "Stallside subscription cancelled immediately (if any)",
  "Marketing, sale, and alert emails stop (sign-in codes still work)",
  "Push alerts stop",
  "Stands go offline (QR links stop working)",
  "Account data is retained",
] as const;

export default function AdminDeleteOwnerButton({
  ownerId,
  businessName,
  email,
}: {
  ownerId: string;
  businessName: string;
  email: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-[var(--radius)] border border-[var(--gone)]/40 bg-[var(--panel)] p-4">
      <h2 className="text-lg font-semibold text-[var(--gone)]">Delete user</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Soft-close {businessName}
        {email ? ` (${email})` : ""} - same as Settings → Delete account. Data
        is kept; they can still sign in, but emails and stands stop.
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
          Delete user
        </button>
      ) : (
        <div className="mt-3 space-y-3 rounded-lg border border-[var(--gone)]/30 bg-[var(--gone)]/5 p-3">
          <p className="text-sm font-semibold text-[var(--gone)]">
            If you continue, the following will happen:
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-sm">
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
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  const result = await adminDeleteOwner(ownerId);
                  if (result && "error" in result && result.error) {
                    setError(result.error);
                    return;
                  }
                  router.push("/admin/owners");
                  router.refresh();
                });
              }}
              className="rounded-lg bg-[var(--gone)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Deleting…" : "Yes, delete this user"}
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
