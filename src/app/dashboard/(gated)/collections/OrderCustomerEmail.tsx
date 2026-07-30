"use client";

import { useState, useTransition } from "react";
import { sendOrderCustomerEmail } from "./email-actions";

export default function OrderCustomerEmail({
  orderId,
  email,
  defaultSubject,
}: {
  orderId: string;
  email: string;
  defaultSubject: string;
}) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setStatus(null);
        }}
        className="text-sm font-medium text-[var(--leaf-dark)] underline print:no-underline"
      >
        {email}
      </button>
    );
  }

  return (
    <div className="mt-2 flex max-w-md flex-col gap-2 rounded-lg border border-[var(--line)] bg-[var(--wash)] p-3 print:hidden">
      <p className="text-xs text-[var(--muted)]">Email {email}</p>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Subject</span>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Message</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
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
              const result = await sendOrderCustomerEmail({
                orderId,
                subject: subject.trim(),
                message: message.trim(),
              });
              if ("error" in result && result.error) {
                setStatus(result.error);
                return;
              }
              setStatus("Sent.");
              setMessage("");
            });
          }}
          className="rounded-lg bg-[var(--leaf)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Sending…" : "Send email"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setOpen(false)}
          className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-sm font-semibold"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
