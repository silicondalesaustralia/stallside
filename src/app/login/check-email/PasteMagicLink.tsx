"use client";

import { useState } from "react";

/** Local-only helper when Resend is not configured (magic link prints to server logs). */
export default function PasteMagicLink() {
  const [url, setUrl] = useState("");

  function openLink() {
    const trimmed = url.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return;
    }
    window.location.href = trimmed;
  }

  return (
    <div className="mt-8 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-4">
      <p className="text-sm font-medium text-[var(--ink)]">Paste magic link</p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Copy the [Stallside magic link] URL from the server logs, paste it here, then open.
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
        className="mt-3 w-full rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-50"
      >
        Open magic link
      </button>
    </div>
  );
}
