"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLockup from "@/components/BrandLockup";
import DashboardBusinessSelect from "@/components/DashboardBusinessSelect";
import type { BusinessOption } from "@/lib/selected-business";

const opsLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/pre-order-pages", label: "Pre-order pages" },
  { href: "/dashboard/subscriptions", label: "Subscriptions" },
  { href: "/dashboard/inventory", label: "Inventory" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/collections", label: "Collections" },
  { href: "/dashboard/notifications", label: "Notifications" },
] as const;

const siteLinks = [
  { href: "/dashboard/knowledge", label: "Guides" },
  { href: "/dashboard/settings", label: "Settings" },
] as const;

const tabs = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/inventory", label: "Stock" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/notifications", label: "Alerts" },
] as const;

function linkActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export default function DashboardNav({
  businesses,
  selectedBusinessId,
}: {
  businesses: BusinessOption[];
  selectedBusinessId: string | null;
}) {
  const pathname = usePathname();

  return (
    <>
      <header className="border-b border-[var(--line)] bg-[var(--panel)]/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <BrandLockup href="/" size="sm" />
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {siteLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[var(--muted)] transition hover:text-[var(--ink)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <DashboardBusinessSelect
            businesses={businesses}
            selectedId={selectedBusinessId}
          />
          <nav className="hidden flex-wrap gap-x-4 gap-y-2 text-sm md:flex">
            {opsLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  linkActive(pathname, link.href)
                    ? "font-semibold text-[var(--ink)]"
                    : "text-[var(--muted)] transition hover:text-[var(--ink)]"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--field)]/20 bg-[var(--field)] pb-[env(safe-area-inset-bottom)] print:hidden md:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-5 gap-0.5 px-1 py-2">
          {tabs.map((tab) => {
            const active = linkActive(pathname, tab.href);
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
