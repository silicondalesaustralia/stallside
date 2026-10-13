"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { clampLogoHeight } from "@/lib/storefront/header-style";

type Drag = { x: number; y: number; startHeight: number; ratio: number; last: number };

/** Corner handle that resizes the header logo; previews while dragging, saves on release. */
export default function LogoResizeHandle({
  height,
  onPreview,
  onCommit,
}: {
  height: number;
  onPreview: (height: number) => void;
  onCommit: (height: number) => void;
}) {
  const drag = useRef<Drag | null>(null);

  function onPointerDown(e: PointerEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    const img = e.currentTarget.parentElement?.querySelector("img");
    const ratio = img && img.offsetHeight > 0 ? img.offsetWidth / img.offsetHeight : 1;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, startHeight: height, ratio, last: height };
  }

  function onPointerMove(e: PointerEvent<HTMLButtonElement>) {
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.x) / d.ratio;
    const dy = e.clientY - d.y;
    const next = clampLogoHeight(d.startHeight + (Math.abs(dx) > Math.abs(dy) ? dx : dy));
    if (next !== undefined && next !== d.last) {
      d.last = next;
      onPreview(next);
    }
  }

  function onPointerUp(e: PointerEvent<HTMLButtonElement>) {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (d.last !== d.startHeight) onCommit(d.last);
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    const step = e.key === "ArrowUp" || e.key === "ArrowRight" ? 4 : e.key === "ArrowDown" || e.key === "ArrowLeft" ? -4 : 0;
    if (!step) return;
    e.preventDefault();
    e.stopPropagation();
    const next = clampLogoHeight(height + step);
    if (next !== undefined && next !== height) onCommit(next);
  }

  return (
    <button
      type="button"
      className="studio-nav__logo-handle"
      aria-label={`Resize logo (${height}px). Drag, or use the arrow keys.`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    />
  );
}
