"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WEBSITE_NAV_LINKS, activeNavHref } from "@/components/dash-nav-links";

/** Website sub-section tabs for small screens (desktop uses the sidebar menu). */
export default function WebsiteMobileSubnav() {
  const pathname = usePathname();
  const activeHref = activeNavHref(pathname, WEBSITE_NAV_LINKS);
  return (
    <nav className="-mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1 pb-1 md:hidden">
      {WEBSITE_NAV_LINKS.map((item) => {
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
              active
                ? "bg-[var(--field)] text-[var(--ink-on-dark)]"
                : "border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
