"use client";

import type { ReactNode, TouchEvent } from "react";

type Props = {
  index: number;
  total: number;
  label: string;
  onPrev: () => void;
  onNext: () => void;
  dots: { id: string; name: string }[];
  onDot: (index: number) => void;
  children: ReactNode;
  onTouchStart: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
};

export default function StyleSliderShell({
  index,
  total,
  label,
  onPrev,
  onNext,
  dots,
  onDot,
  children,
  onTouchStart,
  onTouchEnd,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-xl" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--field)]"
          onClick={onPrev}
          aria-label="Previous style"
        >
          ‹ Prev
        </button>
        <p className="text-xs text-[var(--muted)]">
          {index + 1} of {total} · {label}
        </p>
        <button
          type="button"
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--field)]"
          onClick={onNext}
          aria-label="Next style"
        >
          Next ›
        </button>
      </div>
      {children}
      <div className="mt-3 flex justify-center gap-1.5" role="tablist" aria-label="Style slides">
        {dots.map((bp, i) => (
          <button
            key={bp.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show ${bp.name}`}
            className={
              i === index
                ? "h-2 w-2 rounded-full bg-[var(--field)]"
                : "h-2 w-2 rounded-full bg-[var(--border)]"
            }
            onClick={() => onDot(i)}
          />
        ))}
      </div>
    </div>
  );
}
