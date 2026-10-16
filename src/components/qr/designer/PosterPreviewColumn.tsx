"use client";

import { useState } from "react";
import type { QrPrintSize } from "@/lib/print-qr-sheet";
import QrActions from "@/app/dashboard/(gated)/businesses/[standId]/qr/QrActions";
import QrPagePreview from "@/app/dashboard/(gated)/businesses/[standId]/qr/QrPagePreview";
import QrSignSheet, { type QrSignSheetProps } from "@/app/dashboard/(gated)/businesses/[standId]/qr/QrSignSheet";

export default function PosterPreviewColumn({ sheet, fileName }: { sheet: QrSignSheetProps; fileName: string }) {
  const [size, setSize] = useState<QrPrintSize>("a4");

  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-4 print:contents">
      <QrPagePreview size={size} sheet={sheet} showCaption className="print:hidden" />
      <div className="pointer-events-none fixed left-[-10000px] top-0 w-[210mm]" aria-hidden>
        <QrSignSheet {...sheet} printable layout={size !== "a4" ? "compact" : "full"} printSize={size} />
      </div>
      <div className="print:hidden">
        {!sheet.checkoutUrl.startsWith("https://") ? (
          <p className="mb-3 rounded-lg border border-[var(--warn)]/40 bg-[var(--panel)] px-3 py-2 text-sm text-[var(--warn)]">
            This QR points at a local address. Don&apos;t print it.
          </p>
        ) : null}
        <QrActions
          checkoutUrl={sheet.checkoutUrl}
          qrDataUrl={sheet.qrDataUrl}
          fileName={fileName}
          sheet={sheet}
          size={size}
          onSizeChange={setSize}
        />
      </div>
    </div>
  );
}
