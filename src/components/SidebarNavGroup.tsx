"use client";

import type { ReactNode } from "react";
import type { DashNavGroup, DashNavLink } from "@/components/dash-nav-links";
import { toggleNavGroup, useClosedNavGroups } from "@/components/dash-nav-closed-store";

/** One sidebar section: a coloured, collapsible heading over its links. A closed section still shows the current page. */
export default function SidebarNavGroup({
  group,
  first,
  collapsed,
  activeHref,
  renderLink,
}: {
  group: DashNavGroup;
  first: boolean;
  collapsed: boolean;
  activeHref: string | null;
  renderLink: (link: DashNavLink) => ReactNode;
}) {
  const closedGroups = useClosedNavGroups();
  const heading = group.heading;
  const closed = Boolean(heading) && !collapsed && closedGroups.has(heading!);
  const links = closed ? group.links.filter((l) => l.href === activeHref) : group.links;

  return (
    <div className={first ? undefined : "mt-3"}>
      {heading && !collapsed ? (
        <button
          type="button"
          onClick={() => toggleNavGroup(heading)}
          aria-expanded={!closed}
          className="flex w-full items-center justify-between rounded-md px-3 pb-1 pt-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--marigold)]/85 hover:text-[var(--marigold)]"
        >
          {heading}
          <svg
            viewBox="0 0 12 12"
            aria-hidden
            className={`size-3 transition-transform duration-200 ${closed ? "-rotate-90" : ""}`}
          >
            <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : !first ? (
        <div className="mx-2 mb-2 border-t border-white/10" />
      ) : null}
      {links.length > 0 ? <div className="space-y-0.5">{links.map(renderLink)}</div> : null}
    </div>
  );
}
