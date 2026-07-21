"use client";

import { useState } from "react";

export default function InviteCopyLink({
  url,
  compact = false,
}: {
  url: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => void copy()}
        className="font-mono text-xs text-[var(--leaf-dark)] underline"
      >
        {copied ? "Copied" : "Copy link"}
      </button>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
      <code className="min-w-0 flex-1 break-all rounded bg-black/5 px-3 py-2 text-xs sm:text-sm">
        {url}
      </code>
      <button
        type="button"
        onClick={() => void copy()}
        className="shrink-0 rounded-[var(--radius-pill)] border border-[var(--field)] px-4 py-2 text-sm font-semibold text-[var(--field)] hover:bg-white"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
