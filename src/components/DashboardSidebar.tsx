"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BrandLockup from "@/components/BrandLockup";
import BrandMark from "@/components/BrandMark";
import DashNavIcon from "@/components/DashNavIcon";
import DashSidebarNavItem from "@/components/DashSidebarNavItem";
import DashboardBusinessSelect from "@/components/DashboardBusinessSelect";
import {
  GETTING_STARTED_NAV,
  primaryNavForMode,
  secondaryNavForMode,
  type DashNavItem,
} from "@/components/dash-nav-links";
import {
  setupNavBadge,
  type DashboardSetupAlerts,
} from "@/lib/dashboard-setup-alerts";
import type { BusinessOption } from "@/lib/selected-business";

const MORE_STORAGE = "vendl-dash-more-open";

function NavItemList({
  items,
  collapsed,
  setupAlerts,
  unreadNotifications,
  setupIncomplete,
}: {
  items: readonly DashNavItem[];
  collapsed: boolean;
  setupAlerts: DashboardSetupAlerts;
  unreadNotifications?: number;
  setupIncomplete?: number;
}) {
  return (
    <>
      {items.map((item) => (
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
      ))}
    </>
  );
}

export default function DashboardSidebar({
  businesses,
  selectedBusinessId,
  collapsed,
  onToggle,
  unreadNotifications,
  setupAlerts,
  setupIncomplete = 0,
  businessMode = null,
}: {
  businesses: BusinessOption[];
  selectedBusinessId: string | null;
  collapsed: boolean;
  onToggle: () => void;
  unreadNotifications?: number;
  setupAlerts: DashboardSetupAlerts;
  setupIncomplete?: number;
  businessMode?: string | null;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = primaryNavForMode(businessMode);
  const primaryHrefs = new Set(primary.map((i) => i.href));
  const secondary = secondaryNavForMode(businessMode).filter(
    (i) => !primaryHrefs.has(i.href),
  );

  useEffect(() => {
    try {
      setMoreOpen(localStorage.getItem(MORE_STORAGE) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  function toggleMore() {
    setMoreOpen((prev) => {
      const next = !prev;
      localStorage.setItem(MORE_STORAGE, next ? "1" : "0");
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

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        <div className="mb-2 border-b border-white/10 pb-2">
          <NavItemList
            items={[GETTING_STARTED_NAV]}
            collapsed={collapsed}
            setupAlerts={setupAlerts}
            unreadNotifications={unreadNotifications}
            setupIncomplete={setupIncomplete}
          />
        </div>

        <NavItemList
          items={primary}
          collapsed={collapsed}
          setupAlerts={setupAlerts}
          unreadNotifications={unreadNotifications}
          setupIncomplete={setupIncomplete}
        />

        {secondary.length > 0 ? (
          <div className="mt-4 border-t border-white/10 pt-3">
            {collapsed ? null : (
              <button
                type="button"
                aria-expanded={moreOpen}
                onClick={toggleMore}
                className={`mb-2 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                  moreOpen
                    ? "bg-[var(--marigold)] text-[var(--field)] shadow-sm"
                    : "bg-[var(--marigold)]/25 text-[var(--marigold)] ring-1 ring-[var(--marigold)]/60 hover:bg-[var(--marigold)]/35"
                }`}
              >
                <span>More tools</span>
                <span className="text-sm leading-none" aria-hidden>
                  {moreOpen ? "−" : "+"}
                </span>
              </button>
            )}
            {(collapsed || moreOpen) && (
              <NavItemList
                items={secondary}
                collapsed={collapsed}
                setupAlerts={setupAlerts}
                unreadNotifications={unreadNotifications}
                setupIncomplete={setupIncomplete}
              />
            )}
          </div>
        ) : null}
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
