"use client";

import { QR_PRINT_SIZES, type QrPrintSize } from "@/lib/print-qr-sheet";
import QrPagePreview from "./QrPagePreview";
import type { QrSignSheetProps } from "./QrSignSheet";

export default function QrSizePreviews({
  size,
  onSizeChange,
  sheet,
}: {
  size: QrPrintSize;
  onSizeChange: (size: QrPrintSize) => void;
  sheet: QrSignSheetProps;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-[var(--ink)]">Print size</span>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {QR_PRINT_SIZES.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSizeChange(option.id)}
            className={`flex flex-col gap-2 rounded-[var(--radius-sm)] border p-2 text-left transition ${
              option.id === size
                ? "border-[var(--leaf)] bg-[var(--leaf)]/5 ring-2 ring-[var(--leaf)]"
                : "border-[var(--line)] bg-white hover:border-[var(--field)]/40"
            }`}
          >
            <QrPagePreview size={option.id} sheet={sheet} />
            <div>
              <p className="text-sm font-semibold text-[var(--ink)]">{option.label}</p>
              <p className="text-xs text-[var(--muted)]">{option.hint}</p>
            </div>
          </button>
        ))}
      </div>
      <p className="text-xs text-[var(--muted)]">
        Tap a size to update the preview above
        {size !== "a4" ? " · dashed lines are cut guides" : ""}.
      </p>
    </div>
  );
}
