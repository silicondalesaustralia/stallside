"use client";

import { useState } from "react";
import { printQrSheet } from "@/lib/print-qr-sheet";

export default function QrActions({
  checkoutUrl,
  qrDataUrl,
  fileName,
}: {
  checkoutUrl: string;
  qrDataUrl: string;
  fileName: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(checkoutUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <button
        type="button"
        onClick={printQrSheet}
        className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
      >
        Print QR
      </button>
      <a
        href={qrDataUrl}
        download={fileName}
        className="rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-center text-sm font-semibold text-[var(--ink)]"
      >
        Download PNG
      </a>
      <button
        type="button"
        onClick={() => void copyLink()}
        className="rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink)]"
      >
        {copied ? "Link copied" : "Copy checkout link"}
      </button>
      <a
        href={checkoutUrl}
        target="_blank"
        rel="noreferrer"
        className="rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-center text-sm font-semibold text-[var(--ink)]"
      >
        Open checkout
      </a>
    </div>
  );
}
