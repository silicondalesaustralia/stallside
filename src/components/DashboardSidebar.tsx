"use client";

import { usePathname } from "next/navigation";
import BrandLockup from "@/components/BrandLockup";
import BrandMark from "@/components/BrandMark";
import DashboardBusinessSelect from "@/components/DashboardBusinessSelect";
import SidebarNavGroup from "@/components/SidebarNavGroup";
import SidebarNavItem from "@/components/SidebarNavItem";
import SidebarSoonItem from "@/components/SidebarSoonItem";
import { activeNavHref, visibleNavGroups, type NavAccess } from "@/components/dash-nav-links";
import {
  setupNavBadge,
  type DashboardSetupAlerts,
} from "@/lib/dashboard-setup-alerts";
import type { BusinessOption } from "@/lib/selected-business";

export default function DashboardSidebar({
  businesses,
  selectedBusinessId,
  collapsed,
  onToggle,
  unreadNotifications,
  setupAlerts,
  navAccess,
}: {
  businesses: BusinessOption[];
  selectedBusinessId: string | null;
  collapsed: boolean;
  onToggle: () => void;
  unreadNotifications?: number;
  setupAlerts: DashboardSetupAlerts;
  navAccess: NavAccess;
}) {
  const pathname = usePathname();
  const groups = visibleNavGroups(navAccess.website, navAccess.social);
  const activeHref = activeNavHref(pathname, groups.flatMap((g) => g.links));
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
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {groups.map((group, index) => (
          <SidebarNavGroup
            key={group.heading ?? `group-${index}`}
            group={group}
            first={index === 0}
            collapsed={collapsed}
            activeHref={activeHref}
            renderLink={(link) =>
              link.comingSoon ? (
                <SidebarSoonItem
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  features={link.soonFeatures ?? []}
                  collapsed={collapsed}
                  active={link.href === activeHref}
                />
              ) : (
                <SidebarNavItem
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  collapsed={collapsed}
                  active={link.href === activeHref}
                  badge={setupNavBadge(link.href, setupAlerts, unreadNotifications)}
                />
              )
            }
          />
        ))}
      </nav>
      {collapsed ? null : (
        <div className="border-t border-white/10 px-2 py-3">
          <DashboardBusinessSelect
            businesses={businesses}
            selectedId={selectedBusinessId}
            tone="dark"
            needsBusiness={setupAlerts.needsBusiness}
          />
        </div>
      )}
    </aside>
  );
}
