"use client";

import { useState } from "react";

export default function PasteMagicLink() {
  const [url, setUrl] = useState("");

  function openLink() {
    const trimmed = url.trim();
    if (!trimmed.startsWith("http://localhost") && !trimmed.startsWith("https://")) {
      return;
    }
    window.location.href = trimmed;
  }

  return (
    <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
      <p className="text-sm font-medium text-[var(--ink)]">Local / Simulator</p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Copy the <code className="rounded bg-black/5 px-1">[Stallside magic link]</code> URL
        from your Mac terminal running <code className="rounded bg-black/5 px-1">npm run dev</code>,
        paste it here, then open.
      </p>
      <textarea
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        rows={3}
        placeholder="http://localhost:3000/api/auth/callback/resend?..."
        className="mt-3 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-xs"
      />
      <button
        type="button"
        onClick={openLink}
        disabled={!url.trim()}
        className="mt-3 w-full rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-50"
      >
        Open magic link in app
      </button>
    </div>
  );
}
