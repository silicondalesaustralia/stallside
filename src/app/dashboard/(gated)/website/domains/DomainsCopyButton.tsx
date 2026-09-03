"use client";

import { useState } from "react";

export default function DomainsCopyButton({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
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
      className="shrink-0 rounded-md border border-[var(--line)] bg-white px-2 py-1 text-xs font-semibold hover:border-[var(--leaf)]"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
