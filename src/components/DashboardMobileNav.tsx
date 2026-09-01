"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BrandLockup from "@/components/BrandLockup";
import DashboardBusinessSelect from "@/components/DashboardBusinessSelect";
import {
  dashLinkActive,
  dashNavGroups,
  mobileTabs,
} from "@/components/dash-nav-links";
import {
  setupNavBadge,
  type DashboardSetupAlerts,
} from "@/lib/dashboard-setup-alerts";
import type { BusinessOption } from "@/lib/selected-business";

export default function DashboardMobileNav({
  businesses,
  selectedBusinessId,
  unreadNotifications,
  setupAlerts,
  setupIncomplete = 0,
}: {
  businesses: BusinessOption[];
  selectedBusinessId: string | null;
  unreadNotifications?: number;
  setupAlerts: DashboardSetupAlerts;
  setupIncomplete?: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const moreBadge =
    setupIncomplete > 0 ||
    setupAlerts.needsStripe ||
    (unreadNotifications ?? 0) > 0;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--panel)]/95 backdrop-blur-sm print:hidden md:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <BrandLockup href="/dashboard" size="sm" />
          <button
            type="button"
            aria-expanded={open}
            aria-controls="dash-more-menu"
            onClick={() => setOpen((v) => !v)}
            className="relative rounded-full bg-[var(--field)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-on-dark)]"
          >
            {open ? "Close" : "More"}
            {!open && moreBadge ? (
              <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[var(--gone)]" />
            ) : null}
          </button>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 print:hidden md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-[var(--field)]/55"
            onClick={() => setOpen(false)}
          />
          <div
            id="dash-more-menu"
            className="absolute right-3 top-3 max-h-[min(85vh,36rem)] w-[min(20rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl bg-[var(--field)] p-4 shadow-2xl [color-scheme:dark]"
          >
            <DashboardBusinessSelect
              businesses={businesses}
              selectedId={selectedBusinessId}
              tone="dark"
              needsBusiness={setupAlerts.needsBusiness}
            />
            <nav className="mt-3 flex flex-col gap-3 border-t border-white/10 pt-3">
              {dashNavGroups.map((group) => (
                <div key={group.id}>
                  <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-on-dark)]/40">
                    {group.label}
                  </p>
                  {group.items.map((item) => {
                    if (item.soon) {
                      return (
                        <span
                          key={item.href}
                          className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-[var(--ink-on-dark)]/35"
                        >
                          {item.label}
                          <span className="text-[9px] font-bold uppercase">
                            Soon
                          </span>
                        </span>
                      );
                    }
                    const badge = setupNavBadge(
                      item.href,
                      setupAlerts,
                      unreadNotifications,
                      setupIncomplete,
                    );
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between rounded-lg px-2 py-2.5 text-sm text-[var(--ink-on-dark)] hover:bg-white/10"
                      >
                        <span>{item.label}</span>
                        {badge && badge > 0 ? (
                          <span className="flex size-5 items-center justify-center rounded-full bg-[var(--gone)] text-[10px] font-bold text-white">
                            {badge > 9 ? "9+" : badge}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--field)]/20 bg-[var(--field)] pb-[env(safe-area-inset-bottom)] print:hidden md:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-5 gap-0.5 px-1 py-2">
          {mobileTabs.map((tab) => {
            const active = dashLinkActive(pathname, tab.href);
            const badge = setupNavBadge(
              tab.href,
              setupAlerts,
              unreadNotifications,
              setupIncomplete,
            );
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={`relative flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium sm:text-[11px] ${
                    active
                      ? "text-[var(--ink-on-dark)]"
                      : "text-[var(--ink-on-dark)]/55"
                  }`}
                >
                  {badge && badge > 0 ? (
                    <span className="absolute right-1 top-1 size-2 rounded-full bg-[var(--gone)]" />
                  ) : null}
                  <span
                    className={`size-1.5 rounded-full ${
                      active ? "bg-[var(--marigold)]" : "bg-transparent"
                    }`}
                  />
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
