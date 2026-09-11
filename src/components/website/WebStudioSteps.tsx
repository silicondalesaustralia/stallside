"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WEB_STUDIO_STEPS } from "@/lib/website/web-studio-nav";

/** Step strip for pages outside the unified shell (e.g. templates). */
export default function WebStudioSteps() {
  const pathname = usePathname();
  const onTemplates = pathname.includes("/studio/templates");

  return (
    <div className="mb-6 flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        Web Studio
      </p>
      <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        First add your business details, then your branding. Our AI builder uses those
        to draft your site — then preview, edit the layout, and publish when
        you&apos;re ready.
      </p>
      <nav
        aria-label="Web Studio steps"
        className="flex gap-1 overflow-x-auto border-b border-[var(--line)] pb-px"
      >
        {WEB_STUDIO_STEPS.map((item) => {
          const active = onTemplates && item.href.includes("tab=studio");
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
