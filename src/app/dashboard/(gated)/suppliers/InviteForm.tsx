"use client";

import { useState, useTransition } from "react";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { inviteSupplier } from "./actions";

export default function InviteForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await inviteSupplier(formData);
      if (result && "error" in result && result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Invite sent.");
    });
  }

  return (
    <form action={onSubmit} className="dash-card flex flex-col gap-3 p-4">
      <h2 className="font-semibold text-[var(--field)]">Invite a supplier</h2>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Name</span>
        <input
          name="name"
          required
          className="rounded-lg border border-[var(--line)] px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Email</span>
        <input
          name="email"
          type="email"
          required
          className="rounded-lg border border-[var(--line)] px-3 py-2"
        />
      </label>
      {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
      <button type="submit" disabled={pending} className={dashCtaClass}>
        {pending ? "Sending…" : "Send invite"}
      </button>
    </form>
  );
}
