"use client";

import type { DragEvent } from "react";
import { ChevronLeft, ChevronRight, Star, Trash2 } from "lucide-react";

const ICON_BTN =
  "inline-flex size-7 items-center justify-center rounded-md bg-white/95 text-[var(--ink)] shadow-sm hover:bg-white disabled:opacity-40";

type Props = {
  url: string;
  index: number;
  count: number;
  busy: boolean;
  onMove: (direction: -1 | 1) => void;
  onMakeMain: () => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDrop: () => void;
};

/** One photo in the product photo grid. The first photo is the main photo and shows larger. */
export default function ProductPhotoTile({ url, index, count, busy, onMove, onMakeMain, onRemove, onDragStart, onDrop }: Props) {
  const main = index === 0;
  return (
    <li
      draggable={!busy}
      onDragStart={(e: DragEvent) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      className={`group relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)] ${
        main ? "col-span-2 row-span-2" : ""
      } ${busy ? "" : "cursor-grab active:cursor-grabbing"}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={main ? "Main photo" : `Photo ${index + 1}`} className="aspect-square size-full object-cover" draggable={false} />
      {main ? (
        <span className="absolute left-2 top-2 rounded-full bg-[var(--leaf)] px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
          Main photo
        </span>
      ) : null}
      <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/45 to-transparent p-1.5 pt-6">
        <div className="flex gap-1">
          <button type="button" aria-label="Move earlier" title="Move earlier" disabled={busy || main} className={ICON_BTN} onClick={() => onMove(-1)}>
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button type="button" aria-label="Move later" title="Move later" disabled={busy || index === count - 1} className={ICON_BTN} onClick={() => onMove(1)}>
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
        <div className="flex gap-1">
          {!main ? (
            <button type="button" aria-label="Make main photo" title="Make main photo" disabled={busy} className={ICON_BTN} onClick={onMakeMain}>
              <Star className="size-4" aria-hidden />
            </button>
          ) : null}
          <button type="button" aria-label="Remove photo" title="Remove photo" disabled={busy} className={`${ICON_BTN} text-[var(--gone)]`} onClick={onRemove}>
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </li>
  );
}
