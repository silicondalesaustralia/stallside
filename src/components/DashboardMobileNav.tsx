"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BrandLockup from "@/components/BrandLockup";
import DashboardBusinessSelect from "@/components/DashboardBusinessSelect";
import {
  dashLinkActive,
  GETTING_STARTED_NAV,
  mobileTabsForMode,
  secondaryNavForMode,
  primaryNavForMode,
} from "@/components/dash-nav-links";
import {
  setupNavBadge,
  type DashboardSetupAlerts,
} from "@/lib/dashboard-setup-alerts";
import type { BusinessOption } from "@/lib/selected-business";
import type { DashNavItem } from "@/components/dash-nav-links";

function MobileMoreLink({
  item,
  pathname,
  onClose,
  setupAlerts,
  unreadNotifications,
  setupIncomplete,
}: {
  item: DashNavItem;
  pathname: string;
  onClose: () => void;
  setupAlerts: DashboardSetupAlerts;
  unreadNotifications?: number;
  setupIncomplete?: number;
}) {
  if (item.soon) {
    return (
      <span className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-[var(--ink-on-dark)]/35">
        {item.label}
        <span className="text-[9px] font-bold uppercase">Soon</span>
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
      href={item.href}
      onClick={onClose}
      className={`flex items-center justify-between rounded-lg px-2 py-2.5 text-sm hover:bg-white/10 ${
        dashLinkActive(pathname, item.href)
          ? "text-[var(--ink-on-dark)]"
          : "text-[var(--ink-on-dark)]/80"
      }`}
    >
      <span>{item.label}</span>
      {badge && badge > 0 ? (
        <span className="flex size-5 items-center justify-center rounded-full bg-[var(--gone)] text-[10px] font-bold text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </Link>
  );
}

export default function DashboardMobileNav({
  businesses,
  selectedBusinessId,
  unreadNotifications,
  setupAlerts,
  setupIncomplete = 0,
  businessMode = null,
}: {
  businesses: BusinessOption[];
  selectedBusinessId: string | null;
  unreadNotifications?: number;
  setupAlerts: DashboardSetupAlerts;
  setupIncomplete?: number;
  businessMode?: string | null;
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

  const tabs = mobileTabsForMode(businessMode);

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
            className="relative rounded-full bg-[var(--marigold)] px-3 py-1.5 text-xs font-bold text-[var(--field)] shadow-sm"
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
              <div>
                <MobileMoreLink
                  item={GETTING_STARTED_NAV}
                  pathname={pathname}
                  onClose={() => setOpen(false)}
                  setupAlerts={setupAlerts}
                  unreadNotifications={unreadNotifications}
                  setupIncomplete={setupIncomplete}
                />
              </div>
              <div>
                <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-on-dark)]/40">
                  Main
                </p>
                {primaryNavForMode(businessMode).map((item) => (
                  <MobileMoreLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    onClose={() => setOpen(false)}
                    setupAlerts={setupAlerts}
                    unreadNotifications={unreadNotifications}
                    setupIncomplete={setupIncomplete}
                  />
                ))}
              </div>
              <div>
                <p className="mb-1.5 rounded-lg bg-[var(--marigold)]/25 px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--marigold)] ring-1 ring-[var(--marigold)]/50">
                  More tools
                </p>
                {secondaryNavForMode(businessMode)
                  .filter(
                    (i) =>
                      !primaryNavForMode(businessMode).some(
                        (p) => p.href === i.href,
                      ),
                  )
                  .map((item) => (
                    <MobileMoreLink
                      key={item.href}
                      item={item}
                      pathname={pathname}
                      onClose={() => setOpen(false)}
                      setupAlerts={setupAlerts}
                      unreadNotifications={unreadNotifications}
                      setupIncomplete={setupIncomplete}
                    />
                  ))}
              </div>
            </nav>
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--field)]/20 bg-[var(--field)] pb-[env(safe-area-inset-bottom)] print:hidden md:hidden">
        <ul
          className={`mx-auto grid max-w-lg gap-0.5 px-1 py-2 ${
            tabs.length === 5 ? "grid-cols-5" : "grid-cols-4"
          }`}
        >
          {tabs.map((tab) => {
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
