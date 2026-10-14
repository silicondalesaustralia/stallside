"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

const STORAGE_KEY = "vendl-studio-settings-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 240;
const MAX_WIDTH = 640;

function clampWidth(px: number): number {
  const viewportCap = typeof window === "undefined" ? MAX_WIDTH : Math.floor(window.innerWidth * 0.5);
  return Math.round(Math.min(Math.max(px, MIN_WIDTH), Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, viewportCap))));
}

/** The editor is client-only (`ssr: false`), so reading storage on first render can't mismatch. */
function savedWidth(): number {
  try {
    const saved = Number(window.localStorage.getItem(STORAGE_KEY));
    return saved ? clampWidth(saved) : DEFAULT_WIDTH;
  } catch (err) {
    console.warn("[studio settings width] could not read saved width", err);
    return DEFAULT_WIDTH;
  }
}

/** Right-hand settings column; drag its left edge to resize (remembered in this browser). */
export default function StudioSettingsColumn({ children }: { children: ReactNode }) {
  const [width, setWidth] = useState(savedWidth);
  const drag = useRef<{ startX: number; startWidth: number } | null>(null);

  function commit(next: number) {
    const clamped = clampWidth(next);
    setWidth(clamped);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(clamped));
    } catch (err) {
      console.warn("[studio settings width] could not save width", err);
    }
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startWidth: width };
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    setWidth(clampWidth(drag.current.startWidth + drag.current.startX - e.clientX));
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    commit(drag.current.startWidth + drag.current.startX - e.clientX);
    drag.current = null;
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft") commit(width + 16);
    else if (e.key === "ArrowRight") commit(width - 16);
    else return;
    e.preventDefault();
  }

  return (
    <div className="vendl-studio-settings-column" style={{ width }}>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize settings panel"
        aria-valuemin={MIN_WIDTH}
        aria-valuemax={MAX_WIDTH}
        aria-valuenow={width}
        tabIndex={0}
        title="Drag to resize. Double-click to reset."
        className="vendl-studio-settings-column__handle"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={() => commit(DEFAULT_WIDTH)}
        onKeyDown={onKeyDown}
      />
      {children}
    </div>
  );
}
