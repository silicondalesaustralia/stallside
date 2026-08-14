"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BrandLockup from "@/components/BrandLockup";
import DashboardBusinessSelect from "@/components/DashboardBusinessSelect";
import {
  dashLinkActive,
  mobileTabs,
  secondaryLinks,
} from "@/components/dash-nav-links";
import type { BusinessOption } from "@/lib/selected-business";

export default function DashboardMobileNav({
  businesses,
  selectedBusinessId,
  unreadNotifications,
}: {
  businesses: BusinessOption[];
  selectedBusinessId: string | null;
  unreadNotifications?: number;
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

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--panel)] print:hidden md:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <BrandLockup href="/dashboard" size="sm" />
          <button
            type="button"
            aria-expanded={open}
            aria-controls="dash-more-menu"
            onClick={() => setOpen((v) => !v)}
            className="rounded-full bg-[var(--field)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-on-dark)]"
          >
            {open ? "Close" : "More"}
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
            className="absolute right-3 top-3 w-[min(18rem,calc(100vw-1.5rem))] rounded-2xl bg-[var(--field)] p-4 shadow-2xl [color-scheme:dark]"
          >
            <DashboardBusinessSelect
              businesses={businesses}
              selectedId={selectedBusinessId}
              tone="dark"
            />
            <nav className="mt-3 flex flex-col gap-1 border-t border-white/10 pt-3">
              {secondaryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-2.5 text-sm text-[var(--ink-on-dark)] hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--field)]/20 bg-[var(--field)] pb-[env(safe-area-inset-bottom)] print:hidden md:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-5 gap-0.5 px-1 py-2">
          {mobileTabs.map((tab) => {
            const active = dashLinkActive(pathname, tab.href);
            const badge =
              tab.href === "/dashboard/notifications" ? unreadNotifications : 0;
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
