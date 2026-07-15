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

function SizePreviewCard({
  size,
  active,
  onSelect,
  sheet,
}: {
  size: QrPrintSize;
  active: boolean;
  onSelect: () => void;
  sheet: QrSignSheetProps;
}) {
  const meta = QR_PRINT_SIZES.find((s) => s.id === size)!;
  const count = TILES[size];
  const mm = TILE_MM[size];
  const compact = size !== "a4";
  const gridClass =
    size === "a4"
      ? "grid-cols-1 grid-rows-1"
      : size === "half"
        ? "grid-cols-1 grid-rows-2"
        : "grid-cols-2 grid-rows-2";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col gap-2 rounded-[var(--radius-sm)] border p-2 text-left transition ${
        active
          ? "border-[var(--leaf)] bg-[var(--leaf)]/5 ring-2 ring-[var(--leaf)]"
          : "border-[var(--line)] bg-white hover:border-[var(--field)]/40"
      }`}
    >
      <div
        className={`grid aspect-[210/297] w-full overflow-hidden rounded border border-[var(--line)] bg-white shadow-sm ${gridClass}`}
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
                layout={compact ? "compact" : "full"}
                className="h-full w-full rounded-none border-0 bg-white"
              />
            </FitScale>
          </div>
        ))}
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--ink)]">{meta.label}</p>
        <p className="text-xs text-[var(--muted)]">{meta.hint}</p>
      </div>
    </button>
  );
}

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
          <SizePreviewCard
            key={option.id}
            size={option.id}
            active={option.id === size}
            onSelect={() => onSizeChange(option.id)}
            sheet={sheet}
          />
        ))}
      </div>
      <p className="text-xs text-[var(--muted)]">
        Scaled previews of the real print layout
        {size !== "a4" ? " · dashed lines are cut guides" : ""}.
      </p>
    </div>
  );
}
