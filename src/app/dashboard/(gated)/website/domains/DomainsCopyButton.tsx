"use client";

import { useState } from "react";

export default function DomainsCopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold hover:border-[var(--leaf)]"
    >
      {copied ? "Copied" : "Copy address"}
    </button>
  );
}
