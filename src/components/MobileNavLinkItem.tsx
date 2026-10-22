"use client";

import Link from "next/link";
import { useState } from "react";
import type { DashNavLink } from "@/components/dash-nav-links";

/** One entry in the mobile "More" menu; a "Soon" entry taps open to list what it will include. */
export default function MobileNavLinkItem({
  link,
  badge,
  onNavigate,
}: {
  link: DashNavLink;
  badge?: number;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  if (link.comingSoon) {
    return (
      <div>
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm text-[var(--ink-on-dark)] hover:bg-white/10"
        >
          <span className="opacity-50">{link.label}</span>
          <span className="rounded-full bg-[var(--marigold)] px-1.5 text-[10px] font-bold uppercase text-[var(--field)]">
            Soon
          </span>
        </button>
        {expanded && link.soonFeatures ? (
          <ul className="mb-1 space-y-1 px-2 pb-1 text-xs text-[var(--ink-on-dark)]/75">
            {link.soonFeatures.map((feature) => (
              <li key={feature} className="flex gap-1.5">
                <span aria-hidden className="text-[var(--marigold)]">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-[var(--ink-on-dark)] hover:bg-white/10"
    >
      <span>{link.label}</span>
      {badge && badge > 0 ? (
        <span className="flex size-5 items-center justify-center rounded-full bg-[var(--gone)] text-[10px] font-bold text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </Link>
  );
}
