"use client";

import { useState, useTransition } from "react";
import { updateBusinessName } from "./actions";

export default function BusinessNameForm({
  businessName,
}: {
  businessName: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateBusinessName(formData);
      if (result && "error" in result && result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Business name saved.");
    });
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-2">
      <label className="flex flex-col gap-1.5">
        <span className="font-medium">Business name</span>
        <input
          name="businessName"
          required
          minLength={2}
          maxLength={120}
          defaultValue={businessName}
          className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2.5 outline-none ring-[var(--leaf)] focus:ring-2"
        />
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
