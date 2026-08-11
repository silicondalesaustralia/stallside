"use client";

import { QR_PRINT_SIZES, type QrPrintSize } from "@/lib/print-qr-sheet";
import FitScale from "./FitScale";
import QrSignSheet, { type QrSignSheetProps } from "./QrSignSheet";

const TILES: Record<QrPrintSize, number> = {
  a4: 1,
  half: 2,
  quarter: 4,
};

const TILE_MM: Record<QrPrintSize, { w: number; h: number }> = {
  a4: { w: 210, h: 297 },
  half: { w: 210, h: 148.5 },
  quarter: { w: 105, h: 148.5 },
};

/** A4 page composed of 1 / 2 / 4 sign tiles for the selected print size. */
export default function QrPagePreview({
  size,
  sheet,
  className = "",
  showCaption = false,
}: {
  size: QrPrintSize;
  sheet: QrSignSheetProps;
  className?: string;
  showCaption?: boolean;
}) {
  const count = TILES[size];
  const mm = TILE_MM[size];
  const compact = size !== "a4";
  const meta = QR_PRINT_SIZES.find((s) => s.id === size)!;
  const gridClass =
    size === "a4"
      ? "grid-cols-1 grid-rows-1"
      : size === "half"
        ? "grid-cols-1 grid-rows-2"
        : "grid-cols-2 grid-rows-2";

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div
        className={`grid aspect-[210/297] w-full overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-white shadow-sm ${gridClass}`}
      >
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            className={`min-h-0 overflow-hidden ${
              size === "half" && i === 0 ? "border-b border-dashed border-[var(--line)]" : ""
            } ${
              size === "quarter"
                ? `${i % 2 === 0 ? "border-r" : ""} ${i < 2 ? "border-b" : ""} border-dashed border-[var(--line)]`
                : ""
            }`}
          >
            <FitScale widthMm={mm.w} heightMm={mm.h}>
              <QrSignSheet
                {...sheet}
                printable={false}
                layout={compact ? "compact" : "full"}
                printSize={size}
                className="h-full w-full rounded-none border-0 bg-white"
              />
            </FitScale>
          </div>
        ))}
      </div>
      {showCaption ? (
        <p className="text-center text-xs text-[var(--muted)]">
          Preview · {meta.label} ({meta.hint})
          {size !== "a4" ? " · dashed lines are cut guides" : ""}
        </p>
      ) : null}
    </div>
  );
}
