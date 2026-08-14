"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BrandLockup from "@/components/BrandLockup";
import BrandMark from "@/components/BrandMark";
import DashNavIcon from "@/components/DashNavIcon";
import { adminLinks } from "@/components/admin-nav-links";
import AdminMobileNav from "@/components/AdminMobileNav";
import { dashLinkActive } from "@/components/dash-nav-links";

const STORAGE_KEY = "vendl-admin-sidebar";

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

export default function AdminNav() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  function onToggle() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <>
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
            <div className="min-w-0">
              <BrandLockup href="/" variant="dark" size="sm" />
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--marigold)]">
                Admin
              </p>
            </div>
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
          {adminLinks.map((link) => (
            <NavItem
              key={link.href}
              href={link.href}
              label={link.label}
              collapsed={collapsed}
            />
          ))}
        </nav>
        <div className="border-t border-white/10 px-2 py-3">
          <Link
            href="/dashboard"
            title="Owner dashboard"
            className={`flex items-center rounded-lg text-[var(--marigold)] hover:bg-white/10 ${
              collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
            }`}
          >
            <DashNavIcon href="/dashboard" />
            {collapsed ? null : (
              <span className="truncate text-sm font-medium">Owner app</span>
            )}
          </Link>
        </div>
      </aside>
      <AdminMobileNav />
    </>
  );
}
