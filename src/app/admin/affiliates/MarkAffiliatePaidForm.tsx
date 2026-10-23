"use client";

import { useState, useTransition } from "react";
import { markAffiliatePaid } from "./actions";

export default function MarkAffiliatePaidForm({
  affiliateOwnerId,
  owed,
}: {
  affiliateOwnerId: string;
  owed: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    if (!window.confirm(`Mark ${owed} as paid? Do this after you've sent the money.`)) {
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await markAffiliatePaid(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not mark paid");
      }
    });
  }

  return (
    <form action={onSubmit} className="flex min-w-48 flex-col gap-1.5">
      <input type="hidden" name="affiliateOwnerId" value={affiliateOwnerId} />
      <input
        type="text"
        name="note"
        placeholder="Note (e.g. bank ref)"
        className="rounded border border-[var(--line)] px-2 py-1 text-xs"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[var(--field)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-on-dark)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Mark paid"}
      </button>
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </form>
  );
}
