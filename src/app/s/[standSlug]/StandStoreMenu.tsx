"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { StandStoreNav } from "@/lib/stand-store-nav";
import { buildStandStoreLinks } from "./StandStoreLinks";

export default function StandStoreMenu({
  standSlug,
  nav,
}: {
  standSlug: string;
  nav: StandStoreNav;
}) {
  const [open, setOpen] = useState(false);
  const links = buildStandStoreLinks(standSlug, nav);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (links.length === 0) return null;

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="flex size-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--panel)]"
      >
        <span className="flex flex-col gap-1" aria-hidden>
          <span className="block h-0.5 w-4 bg-[var(--field)]" />
          <span className="block h-0.5 w-4 bg-[var(--field)]" />
          <span className="block h-0.5 w-4 bg-[var(--field)]" />
        </span>
      </button>
      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-[var(--field)]/55"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-3 top-3 w-[min(16rem,calc(100vw-1.5rem))] rounded-2xl bg-[var(--field)] p-4 shadow-2xl [color-scheme:dark]">
            <nav className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-2.5 text-sm text-[var(--ink-on-dark)]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
