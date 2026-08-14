"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
}: {
  businesses: BusinessOption[];
  selectedBusinessId: string | null;
}) {
  const pathname = usePathname();

  return (
    <>
      <header className="border-b border-[var(--line)] bg-[var(--panel)]/90 backdrop-blur print:hidden md:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <BrandLockup href="/dashboard" size="sm" />
          <details className="relative">
            <summary className="cursor-pointer list-none rounded-full bg-[var(--field)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-on-dark)] [&::-webkit-details-marker]:hidden">
              More
            </summary>
            <div className="absolute right-0 z-40 mt-2 w-56 rounded-2xl bg-[var(--panel)] p-3 shadow-xl outline outline-[var(--line)]">
              <DashboardBusinessSelect
                businesses={businesses}
                selectedId={selectedBusinessId}
              />
              <div className="mt-3 flex flex-col gap-1">
                {secondaryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-2 py-2 text-sm text-[var(--ink)] hover:bg-[var(--wash)]"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/dashboard/inventory"
                  className="rounded-lg px-2 py-2 text-sm text-[var(--ink)] hover:bg-[var(--wash)]"
                >
                  Inventory
                </Link>
              </div>
            </div>
          </details>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--field)]/20 bg-[var(--field)] pb-[env(safe-area-inset-bottom)] print:hidden md:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-5 gap-0.5 px-1 py-2">
          {mobileTabs.map((tab) => {
            const active = dashLinkActive(pathname, tab.href);
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium sm:text-[11px] ${
                    active
                      ? "text-[var(--ink-on-dark)]"
                      : "text-[var(--ink-on-dark)]/55"
                  }`}
                >
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
