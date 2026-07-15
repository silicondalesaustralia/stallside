"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLockup from "@/components/BrandLockup";

const desktopLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/stands", label: "My stands" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/inventory", label: "Inventory" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/knowledge", label: "Guides" },
  { href: "/dashboard/settings", label: "Settings" },
] as const;

const tabs = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/stands", label: "Stands" },
  { href: "/dashboard/inventory", label: "Stock" },
  { href: "/dashboard/orders", label: "Orders" },
] as const;

function tabActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <>
      <header className="border-b border-[var(--line)] bg-[var(--panel)]/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <BrandLockup href="/dashboard" size="sm" />
          <nav className="hidden flex-wrap gap-x-4 gap-y-2 text-sm md:flex">
            {desktopLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[var(--muted)] transition hover:text-[var(--ink)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex gap-4 text-sm md:hidden">
            <Link href="/dashboard/knowledge" className="text-[var(--muted)] underline">
              Guides
            </Link>
            <Link href="/dashboard/settings" className="text-[var(--muted)] underline">
              Settings
            </Link>
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--field)]/20 bg-[var(--field)] pb-[env(safe-area-inset-bottom)] print:hidden md:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 py-2">
          {tabs.map((tab) => {
            const active = tabActive(pathname, tab.href);
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium ${
                    active ? "text-[var(--ink-on-dark)]" : "text-[var(--ink-on-dark)]/55"
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${active ? "bg-[var(--marigold)]" : "bg-transparent"}`}
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
