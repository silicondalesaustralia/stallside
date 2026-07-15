"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { joinCardPaypalWaitlist } from "@/app/waitlist/actions";

export default function WaitlistModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setMessage(null);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await joinCardPaypalWaitlist(formData);
      if ("error" in result) {
        setMessage(result.error);
        return;
      }
      setMessage(
        result.alreadyJoined
          ? "You're already on the waitlist. We'll be in touch."
          : "You're on the list. We'll email you when Card / PayPal launches.",
      );
    });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 m-auto w-[min(100%-2rem,24rem)] rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-0 text-[var(--ink)] shadow-xl backdrop:bg-black/45 open:flex open:flex-col"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-lg font-semibold tracking-tight">
              Join the Card / PayPal waitlist
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Get notified when Tap &amp; Go and PayPal checkout go live.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-sm text-[var(--muted)] hover:bg-[var(--wash)]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form action={onSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Name</span>
            <input
              name="name"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
              className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--leaf)] focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--leaf)] focus:ring-2"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="mt-1 rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-50"
          >
            {pending ? "Joining…" : "Join waitlist"}
          </button>
          {message ? (
            <p className="text-sm text-[var(--leaf-dark)]">{message}</p>
          ) : null}
        </form>
      </div>
    </dialog>
  );
}
