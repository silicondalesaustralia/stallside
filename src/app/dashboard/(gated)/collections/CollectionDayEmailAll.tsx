"use client";

import { useState, useTransition } from "react";
import { sendCollectionGroupCustomerEmails } from "./email-actions";

export default function CollectionDayEmailAll({
  orderIds,
  dayLabel,
  recipientCount,
}: {
  orderIds: string[];
  dayLabel: string;
  recipientCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(`Collection · ${dayLabel}`);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (recipientCount === 0) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setStatus(null);
        }}
        className="text-sm font-medium text-[var(--leaf-dark)] underline print:hidden"
      >
        Email all ({recipientCount})
      </button>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 rounded-lg border border-[var(--line)] bg-[var(--wash)] p-4 print:hidden">
      <p className="text-sm text-[var(--muted)]">
        Email all {recipientCount} customer
        {recipientCount === 1 ? "" : "s"} for {dayLabel}
      </p>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Subject</span>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Message</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Same message goes to everyone on this pre-order page."
          className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      {status ? <p className="text-sm text-[var(--muted)]">{status}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending || !subject.trim() || !message.trim()}
          onClick={() => {
            setStatus(null);
            startTransition(async () => {
              const result = await sendCollectionGroupCustomerEmails({
                orderIds,
                subject: subject.trim(),
                message: message.trim(),
              });
              if ("error" in result && result.error) {
                setStatus(result.error);
                return;
              }
              setStatus(
                "summary" in result && result.summary
                  ? result.summary
                  : "Sent.",
              );
              setMessage("");
            });
          }}
          className="rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Sending…" : `Send to ${recipientCount}`}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setOpen(false)}
          className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-semibold"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
