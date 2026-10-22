"use client";

import Link from "next/link";
import { useState } from "react";
import DashNavIcon from "@/components/DashNavIcon";

type Anchor = { top: number; left: number };

/** A greyed "Soon" sidebar link; hovering or focusing it lists what the section will include. */
export default function SidebarSoonItem({
  href,
  label,
  features,
  collapsed,
  active,
}: {
  href: string;
  label: string;
  features: readonly string[];
  collapsed: boolean;
  active: boolean;
}) {
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  function show(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    setAnchor({ top: rect.top, left: rect.right + 8 });
  }

  return (
    <Link
      href={href}
      aria-describedby={anchor ? `${label}-soon` : undefined}
      onMouseEnter={(e) => show(e.currentTarget)}
      onFocus={(e) => show(e.currentTarget)}
      onMouseLeave={() => setAnchor(null)}
      onBlur={() => setAnchor(null)}
      onClick={() => setAnchor(null)}
      className={`flex items-center rounded-lg text-[var(--ink-on-dark)]/70 outline-none hover:bg-white/10 focus-visible:bg-white/10 ${
        collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2"
      } ${active ? "bg-white/12" : ""}`}
    >
      <span className="opacity-50">
        <DashNavIcon href={href} />
      </span>
      {collapsed ? null : (
        <span className="flex flex-1 items-center justify-between gap-2">
          <span className="truncate text-sm opacity-50">{label}</span>
          <span className="rounded-full bg-[var(--marigold)] px-1.5 text-[10px] font-bold uppercase text-[var(--field)]">
            Soon
          </span>
        </span>
      )}
      {anchor ? (
        <div
          id={`${label}-soon`}
          role="tooltip"
          style={{ top: anchor.top, left: anchor.left }}
          className="fixed z-50 w-72 rounded-xl bg-[var(--panel)] p-4 text-[var(--ink)] shadow-2xl ring-1 ring-black/10 [color-scheme:light]"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
            {label} · Coming soon
          </p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {features.map((feature) => (
              <li key={feature} className="flex gap-2">
                <span aria-hidden className="text-[var(--leaf)]">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Link>
  );
}
