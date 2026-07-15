"use client";

import { useState } from "react";
import { printQrSheet, type QrPrintSize } from "@/lib/print-qr-sheet";
import type { QrSignSheetProps } from "./QrSignSheet";
import QrSizePreviews from "./QrSizePreviews";

export default function QrActions({
  checkoutUrl,
  qrDataUrl,
  fileName,
  sheet,
}: {
  checkoutUrl: string;
  qrDataUrl: string;
  fileName: string;
  sheet: QrSignSheetProps;
}) {
  const [copied, setCopied] = useState(false);
  const [size, setSize] = useState<QrPrintSize>("a4");

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
    <div className="flex flex-col gap-4">
      <QrSizePreviews size={size} onSizeChange={setSize} sheet={sheet} />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => printQrSheet(size)}
          className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          Print {size === "a4" ? "A4" : size === "half" ? "Half A4" : "Quarter A4"}
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
    </div>
  );
}
