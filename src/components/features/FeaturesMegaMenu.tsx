"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { FEATURE_MENU_COLUMNS } from "@/lib/features/menu";

type Props = {
  /** Prefix in-page home anchors when on /sell, etc. Unused for features. */
  className?: string;
};

export default function FeaturesMegaMenu({ className }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={`relative ${className ?? ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="hover:text-[var(--leaf)]"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        Product Features
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute left-1/2 top-full z-50 w-[min(92vw,920px)] -translate-x-1/2 pt-3"
      >
        <div className="rounded-lg border border-[var(--line)] bg-[#faf9f5] p-5 shadow-[0_18px_50px_#17361f22]">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_MENU_COLUMNS.map((column) => (
              <div key={column.heading}>
                <p className="text-[10px] font-bold tracking-[0.14em] text-[var(--muted)]">
                  {column.heading.toUpperCase()}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {column.items.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/features/${item.slug}`}
                        className="text-sm font-semibold text-[var(--field)] hover:text-[var(--leaf)]"
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-4 border-t border-[var(--line)] pt-4 text-sm font-semibold">
            <Link href="/features" className="text-[var(--leaf)] hover:underline" onClick={() => setOpen(false)}>
              All product features →
            </Link>
            <Link href="/#pricing" className="text-[var(--field)] hover:text-[var(--leaf)]" onClick={() => setOpen(false)}>
              Compare Free &amp; Pro
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
