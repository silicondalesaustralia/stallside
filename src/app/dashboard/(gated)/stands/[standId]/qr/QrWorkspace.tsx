"use client";

import { useState, type ReactNode } from "react";
import type { QrPrintSize } from "@/lib/print-qr-sheet";
import type { QrSignSheetProps } from "./QrSignSheet";
import QrActions from "./QrActions";
import QrPagePreview from "./QrPagePreview";
import QrSignSheet from "./QrSignSheet";

export default function QrWorkspace({
  sheet,
  checkoutUrl,
  qrDataUrl,
  fileName,
  urlWarning,
}: {
  sheet: QrSignSheetProps;
  checkoutUrl: string;
  qrDataUrl: string;
  fileName: string;
  urlWarning?: ReactNode;
}) {
  const [size, setSize] = useState<QrPrintSize>("a4");
  const compact = size !== "a4";

  return (
    <>
      <QrPagePreview
        size={size}
        sheet={sheet}
        showCaption
        className="print:hidden"
      />

      {/* Unscaled print source for printQrSheet — layout follows selected size */}
      <div
        className="pointer-events-none fixed left-[-10000px] top-0 w-[210mm]"
        aria-hidden
      >
        <QrSignSheet
          {...sheet}
          printable
          layout={compact ? "compact" : "full"}
          printSize={size}
        />
      </div>

      <div className="print:hidden">
        {urlWarning}
        <QrActions
          checkoutUrl={checkoutUrl}
          qrDataUrl={qrDataUrl}
          fileName={fileName}
          sheet={sheet}
          size={size}
          onSizeChange={setSize}
        />
      </div>
    </>
  );
}
