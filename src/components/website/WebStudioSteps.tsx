"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { hubNavItemActive } from "@/components/dash-nav-links";
import { WEB_STUDIO_STEPS } from "@/lib/website/web-studio-nav";

/** Step strip for the create-site flow under Website → Web Studio. */
export default function WebStudioSteps() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        Web Studio
      </p>
      <nav
        aria-label="Web Studio steps"
        className="flex gap-1 overflow-x-auto border-b border-[var(--line)] pb-px"
      >
        {WEB_STUDIO_STEPS.map((item) => {
          const active = hubNavItemActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-t-lg px-3 py-2 text-sm font-semibold ${
                active
                  ? "border border-b-0 border-[var(--line)] bg-white text-[var(--field)]"
                  : "text-[var(--muted)] hover:text-[var(--field)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
