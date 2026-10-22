"use client";

import Link from "next/link";
import type { DashNavLink } from "@/components/dash-nav-links";

/** One entry in the mobile "More" menu; a "Soon" entry is greyed with a tag. */
export default function MobileNavLinkItem({
  link,
  badge,
  onNavigate,
}: {
  link: DashNavLink;
  badge?: number;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-[var(--ink-on-dark)] hover:bg-white/10"
    >
      <span className={link.comingSoon ? "opacity-50" : undefined}>{link.label}</span>
      {link.comingSoon ? (
        <span className="rounded-full bg-[var(--marigold)] px-1.5 text-[10px] font-bold uppercase text-[var(--field)]">
          Soon
        </span>
      ) : null}
      {badge && badge > 0 ? (
        <span className="flex size-5 items-center justify-center rounded-full bg-[var(--gone)] text-[10px] font-bold text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </Link>
  );
}
