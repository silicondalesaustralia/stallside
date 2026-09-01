"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import DashNavIcon from "@/components/DashNavIcon";
import { dashLinkActive, type DashNavItem } from "@/components/dash-nav-links";

export default function DashSidebarNavItem({
  item,
  collapsed,
  badge,
}: {
  item: DashNavItem;
  collapsed: boolean;
  badge?: number;
}) {
  const pathname = usePathname();

  if (item.soon) {
    return (
      <span
        title={collapsed ? `${item.label} — coming soon` : undefined}
        className={`flex items-center rounded-lg text-[var(--ink-on-dark)]/35 ${
          collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2"
        }`}
      >
        <DashNavIcon href={item.href} />
        {collapsed ? null : (
          <span className="flex flex-1 items-center justify-between gap-2 truncate text-sm">
            {item.label}
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--ink-on-dark)]/50">
              Soon
            </span>
          </span>
        )}
      </span>
    );
  }

  const active = dashLinkActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`flex items-center rounded-lg transition-colors duration-200 ${
        collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2"
      } ${
        active
          ? "bg-white/12 text-[var(--ink-on-dark)]"
          : "text-[var(--ink-on-dark)]/70 hover:bg-white/10 hover:text-[var(--ink-on-dark)]"
      }`}
    >
      <span className={`relative ${active ? "text-[var(--marigold)]" : ""}`}>
        <DashNavIcon href={item.href} />
        {badge && badge > 0 ? (
          <span className="absolute -right-1 -top-1 size-2 rounded-full bg-[var(--gone)]" />
        ) : null}
      </span>
      {collapsed ? null : (
        <span className="flex flex-1 items-center justify-between gap-2">
          <span className="truncate text-sm">{item.label}</span>
          {badge && badge > 0 ? (
            <span className="flex size-5 items-center justify-center rounded-full bg-[var(--gone)] text-[10px] font-bold text-white">
              {badge > 9 ? "9+" : badge}
            </span>
          ) : null}
        </span>
      )}
    </Link>
  );
}
