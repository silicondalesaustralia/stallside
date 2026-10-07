"use client";

import { useState, useTransition } from "react";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { markSupplierPaid } from "./member-actions";

export default function PayoutForm({ memberId }: { memberId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await markSupplierPaid(formData);
      if (result && "error" in result && result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Marked as paid.");
    });
  }

  return (
    <form action={onSubmit} className="dash-card flex flex-col gap-3 p-4">
      <h2 className="font-semibold text-[var(--field)]">Mark paid</h2>
      <p className="text-sm text-[var(--muted)]">
        Record a transfer you made outside Vendl. This does not move money.
      </p>
      <input type="hidden" name="memberId" value={memberId} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Amount</span>
        <input
          name="amount"
          required
          className="rounded-lg border border-[var(--line)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Note</span>
        <input
          name="note"
          className="rounded-lg border border-[var(--line)] px-3 py-2"
        />
      </label>
      {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
      <button type="submit" disabled={pending} className={dashCtaClass}>
        {pending ? "Saving…" : "Mark paid"}
      </button>
    </form>
  );
}
