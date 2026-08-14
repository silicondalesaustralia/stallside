"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLockup from "@/components/BrandLockup";
import { adminLinks } from "@/components/admin-nav-links";
import { dashLinkActive } from "@/components/dash-nav-links";

export default function AdminMobileNav() {
  const pathname = usePathname();
  return (
    <header className="border-b border-[var(--line)] bg-[var(--field)] px-4 py-3 text-[var(--ink-on-dark)] md:hidden">
      <div className="flex items-center justify-between gap-3">
        <BrandLockup href="/" variant="dark" size="sm" />
        <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--marigold)]">
          Admin
        </span>
      </div>
      <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 text-sm">
        {adminLinks.map((link) => {
          const active = dashLinkActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-full px-3 py-1.5 ${
                active
                  ? "bg-[var(--marigold)] font-semibold text-[var(--field)]"
                  : "bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        <Link
          href="/dashboard"
          className="shrink-0 rounded-full bg-white/10 px-3 py-1.5"
        >
          Owner
        </Link>
      </nav>
    </header>
  );
}
