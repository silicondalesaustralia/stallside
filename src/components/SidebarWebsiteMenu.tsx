"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import DashNavIcon from "@/components/DashNavIcon";
import {
  WEBSITE_HUB_NAV,
  dashLinkActive,
  hubNavItemActive,
  websiteLink,
} from "@/components/dash-nav-links";

/** Sidebar "Website" entry; expands to its sub-sections while inside /dashboard/website. */
export default function SidebarWebsiteMenu({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const active = dashLinkActive(pathname, websiteLink.href);

  return (
    <div>
      <Link
        href={websiteLink.href}
        title={collapsed ? websiteLink.label : undefined}
        className={`flex items-center rounded-lg transition-colors duration-200 ${
          collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
        } ${
          active
            ? "bg-white/12 text-[var(--ink-on-dark)]"
            : "text-[var(--ink-on-dark)]/70 hover:bg-white/10 hover:text-[var(--ink-on-dark)]"
        }`}
      >
        <span className={active ? "text-[var(--marigold)]" : undefined}>
          <DashNavIcon href={websiteLink.href} />
        </span>
        {collapsed ? null : (
          <span className="flex flex-1 items-center justify-between gap-2">
            <span className="truncate text-sm">{websiteLink.label}</span>
            <span className="text-[10px] text-[var(--ink-on-dark)]/50">{active ? "▾" : "▸"}</span>
          </span>
        )}
      </Link>
      {active && !collapsed ? (
        <ul className="mb-1 ml-6 mt-1 space-y-0.5 border-l border-white/10 pl-3">
          {WEBSITE_HUB_NAV.map((item) => {
            const itemActive = hubNavItemActive(pathname, item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded-md px-2 py-1.5 text-[13px] transition-colors ${
                    itemActive
                      ? "bg-white/10 font-semibold text-[var(--ink-on-dark)]"
                      : "text-[var(--ink-on-dark)]/65 hover:bg-white/10 hover:text-[var(--ink-on-dark)]"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
