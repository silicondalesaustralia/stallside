"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLockup from "@/components/BrandLockup";
import BrandMark from "@/components/BrandMark";
import DashNavIcon from "@/components/DashNavIcon";
import DashboardBusinessSelect from "@/components/DashboardBusinessSelect";
import {
  dashLinkActive,
  primaryLinks,
  secondaryLinks,
} from "@/components/dash-nav-links";
import type { BusinessOption } from "@/lib/selected-business";

function NavItem({
  href,
  label,
  collapsed,
}: {
  href: string;
  label: string;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const active = dashLinkActive(pathname, href);
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`flex items-center rounded-lg transition-colors duration-200 ${
        collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
      } ${
        active
          ? "bg-white/12 text-[var(--ink-on-dark)]"
          : "text-[var(--ink-on-dark)]/70 hover:bg-white/10 hover:text-[var(--ink-on-dark)]"
      }`}
    >
      <span className={active ? "text-[var(--marigold)]" : undefined}>
        <DashNavIcon href={href} />
      </span>
      {collapsed ? null : <span className="truncate text-sm">{label}</span>}
    </Link>
  );
}

export default function DashboardSidebar({
  businesses,
  selectedBusinessId,
  collapsed,
  onToggle,
}: {
  businesses: BusinessOption[];
  selectedBusinessId: string | null;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      className={`sticky top-3 m-3 hidden h-[calc(100vh-1.5rem)] shrink-0 flex-col rounded-2xl bg-[var(--field)] shadow-2xl print:hidden md:flex [color-scheme:dark] ${
        collapsed ? "w-[4.5rem]" : "w-64"
      }`}
    >
      <div
        className={`flex border-b border-white/10 py-3 ${
          collapsed
            ? "flex-col items-center gap-1 px-2"
            : "items-center justify-between px-3"
        }`}
      >
        {collapsed ? (
          <BrandMark variant="dark" className="size-8" />
        ) : (
          <BrandLockup href="/dashboard" variant="dark" size="sm" />
        )}
        <button
          type="button"
          title={collapsed ? "Expand menu" : "Collapse menu"}
          onClick={onToggle}
          className="rounded-lg p-2 text-[var(--ink-on-dark)]/70 hover:bg-white/10 hover:text-[var(--ink-on-dark)]"
        >
          <span className="text-xs font-bold">{collapsed ? "»" : "«"}</span>
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {primaryLinks.map((link) => (
          <NavItem
            key={link.href}
            href={link.href}
            label={link.label}
            collapsed={collapsed}
          />
        ))}
        <div className="my-2 border-t border-white/10" />
        {secondaryLinks.map((link) => (
          <NavItem
            key={link.href}
            href={link.href}
            label={link.label}
            collapsed={collapsed}
          />
        ))}
      </nav>
      <div className="border-t border-white/10 px-2 py-3">
        {collapsed ? (
          <Link
            href="/dashboard/settings"
            title="Settings"
            className="flex justify-center rounded-lg px-2 py-2 text-[var(--ink-on-dark)]/80 hover:bg-white/10"
          >
            <span className="flex size-8 items-center justify-center text-[var(--ink-on-dark)]">
              <DashNavIcon href="/dashboard/settings" />
            </span>
          </Link>
        ) : (
          <>
            <DashboardBusinessSelect
              businesses={businesses}
              selectedId={selectedBusinessId}
              tone="dark"
            />
            <Link
              href="/dashboard/settings"
              className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/10"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-[var(--ink-on-dark)]/15 text-xs font-medium text-[var(--ink-on-dark)]">
                Me
              </span>
              <span className="truncate text-sm font-medium text-[var(--ink-on-dark)]">
                Account
              </span>
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
