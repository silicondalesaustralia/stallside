"use client";

import { useState, useTransition } from "react";
import { createListFromCsv } from "../actions";

export default function CsvUploadForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        setMessage(null);
        startTransition(async () => {
          const result = await createListFromCsv(fd);
          if (result?.error) setMessage(result.error);
        });
      }}
      className="flex flex-col gap-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5"
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">List name</span>
        <input
          name="name"
          required
          maxLength={120}
          placeholder="Spring newsletter"
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">CSV</span>
        <textarea
          name="csv"
          required
          rows={12}
          placeholder={"email,name,phone\nalice@example.com,Alice,+61…"}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 font-mono text-xs"
        />
      </label>
      {message ? <p className="text-sm text-[var(--warn)]">{message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Importing…" : "Create list"}
      </button>
    </form>
  );
}
