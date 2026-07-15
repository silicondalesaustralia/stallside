"use client";

import { useState } from "react";

/** Open the magic link inside this window (required for iPhone Home Screen / PWA login). */
export default function PasteMagicLink() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  function openLink() {
    setError(null);
    const trimmed = url.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      setError("Paste the full https://stallside.app/… sign-in URL from the email.");
      return;
    }
    window.location.assign(trimmed);
  }

  return (
    <div className="mt-8 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-4">
      <p className="text-sm font-medium text-[var(--ink)]">Home Screen sign-in</p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Tapping the email link opens Safari instead of Stallside. In Mail, copy the
        sign-in URL, paste it below, then open — stay in this Home Screen app.
      </p>
      <textarea
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        rows={3}
        placeholder="https://stallside.app/api/auth/callback/resend?..."
        className="mt-3 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-xs"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
      <button
        type="button"
        onClick={openLink}
        disabled={!url.trim()}
        className="mt-3 w-full rounded-[var(--radius-pill)] bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)] disabled:opacity-50"
      >
        Open magic link here
      </button>
    </div>
  );
}
