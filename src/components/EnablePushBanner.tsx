"use client";

import { useState } from "react";
import { registerOwnerWebPush } from "@/lib/register-owner-web-push";

export default function EnablePushBanner({
  onDone,
  hint,
}: {
  onDone: () => void;
  hint: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enable() {
    setPending(true);
    setError(null);
    try {
      const result = await registerOwnerWebPush();
      if ("error" in result) {
        setError(result.error);
        return;
      }
      onDone();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="border-b border-[var(--marigold)]/40 bg-[color-mix(in_srgb,var(--marigold)_14%,white)] px-4 py-3 print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--field)]">{hint}</p>
        <button
          type="button"
          disabled={pending}
          onClick={() => void enable()}
          className="w-fit shrink-0 rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Enabling…" : "Enable phone alerts"}
        </button>
      </div>
      {error ? <p className="mx-auto mt-2 max-w-6xl text-sm text-[var(--gone)]">{error}</p> : null}
    </div>
  );
}
