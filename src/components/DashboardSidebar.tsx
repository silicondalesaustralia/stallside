"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BrandLockup from "@/components/BrandLockup";
import BrandMark from "@/components/BrandMark";
import DashNavIcon from "@/components/DashNavIcon";
import DashSidebarNavItem from "@/components/DashSidebarNavItem";
import DashboardBusinessSelect from "@/components/DashboardBusinessSelect";
import { dashNavGroups } from "@/components/dash-nav-links";
import {
  setupNavBadge,
  type DashboardSetupAlerts,
} from "@/lib/dashboard-setup-alerts";
import type { BusinessOption } from "@/lib/selected-business";

const GROUP_STORAGE = "vendl-dash-nav-groups";

export default function DashboardSidebar({
  businesses,
  selectedBusinessId,
  collapsed,
  onToggle,
  unreadNotifications,
  setupAlerts,
  setupIncomplete = 0,
}: {
  businesses: BusinessOption[];
  selectedBusinessId: string | null;
  collapsed: boolean;
  onToggle: () => void;
  unreadNotifications?: number;
  setupAlerts: DashboardSetupAlerts;
  setupIncomplete?: number;
}) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(GROUP_STORAGE);
      if (raw) setOpenGroups(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      /* ignore */
    }
  }, []);

  function toggleGroup(id: string) {
    setOpenGroups((prev) => {
      const next = { ...prev, [id]: !(prev[id] ?? true) };
      localStorage.setItem(GROUP_STORAGE, JSON.stringify(next));
      return next;
    });
  }

  return (
    <aside
      className={`sticky top-3 m-3 hidden h-[calc(100vh-1.5rem)] shrink-0 flex-col rounded-2xl bg-[var(--field)] shadow-[var(--dash-shadow)] print:hidden md:flex [color-scheme:dark] ${
        collapsed ? "w-[4.5rem]" : "w-[16.5rem]"
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
          className="rounded-lg p-2 text-[var(--ink-on-dark)]/70 hover:bg-white/10"
        >
          <span className="text-xs font-bold">{collapsed ? "»" : "«"}</span>
        </button>
      </div>

      <nav className="flex-1 space-y-3 overflow-y-auto px-2 py-3">
        {dashNavGroups.map((group) => {
          const open = collapsed || (openGroups[group.id] ?? true);
          return (
            <div key={group.id}>
              {collapsed ? null : (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="mb-1 flex w-full items-center justify-between px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-on-dark)]/40"
                >
                  {group.label}
                  <span className="text-[9px]">{open ? "−" : "+"}</span>
                </button>
              )}
              {open
                ? group.items.map((item) => (
                    <DashSidebarNavItem
                      key={item.href}
                      item={item}
                      collapsed={collapsed}
                      badge={setupNavBadge(
                        item.href,
                        setupAlerts,
                        unreadNotifications,
                        setupIncomplete,
                      )}
                    />
                  ))
                : null}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-2 py-3">
        {collapsed ? (
          <Link
            href="/dashboard/settings"
            title="Settings"
            className="flex justify-center rounded-lg px-2 py-2 text-[var(--ink-on-dark)]/80 hover:bg-white/10"
          >
            <DashNavIcon href="/dashboard/settings" />
          </Link>
        ) : (
          <DashboardBusinessSelect
            businesses={businesses}
            selectedId={selectedBusinessId}
            tone="dark"
            needsBusiness={setupAlerts.needsBusiness}
          />
        )}
      </div>
    </aside>
  );
}
