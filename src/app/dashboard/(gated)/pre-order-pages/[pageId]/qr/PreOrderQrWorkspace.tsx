"use client";

import { useState } from "react";
import {
  printQrSheet,
  QR_PRINT_SIZES,
  type QrPrintSize,
} from "@/lib/print-qr-sheet";
import PreOrderQrSheet, { type PreOrderQrSheetProps } from "./PreOrderQrSheet";

export default function PreOrderQrWorkspace({
  sheet,
  orderUrl,
  qrDataUrl,
  fileName,
}: {
  sheet: PreOrderQrSheetProps;
  orderUrl: string;
  qrDataUrl: string;
  fileName: string;
}) {
  const [size, setSize] = useState<QrPrintSize>("a4");
  const [copied, setCopied] = useState(false);
  const compact = size !== "a4";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(orderUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-white print:hidden">
        <PreOrderQrSheet {...sheet} printable={false} layout="full" />
      </div>

      <div
        className="pointer-events-none fixed left-[-10000px] top-0 w-[210mm]"
        aria-hidden
      >
        <PreOrderQrSheet
          {...sheet}
          printable
          layout={compact ? "compact" : "full"}
          printSize={size}
        />
      </div>

      <div className="flex flex-col gap-4 print:hidden">
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Print size</legend>
          {QR_PRINT_SIZES.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSize(opt.id)}
              className={`rounded-lg border px-3 py-2 text-sm ${
                size === opt.id
                  ? "border-[var(--leaf)] bg-[var(--leaf)]/10 font-semibold"
                  : "border-[var(--line)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </fieldset>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => printQrSheet(size)}
            className="rounded-lg bg-[var(--leaf)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
          >
            Print{" "}
            {size === "a4" ? "A4" : size === "half" ? "Half A4" : "Quarter A4"}
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
            {copied ? "Link copied" : "Copy order link"}
          </button>
        </div>
      </div>
    </>
  );
}
