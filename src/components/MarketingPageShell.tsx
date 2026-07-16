import type { ReactNode } from "react";
import Link from "next/link";
import BrandLockup from "@/components/BrandLockup";
import LandingFooter from "@/components/LandingFooter";

export default function MarketingPageShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-[var(--wash)]">
      <header className="border-b border-[var(--line)] bg-[var(--panel)]/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-4 sm:px-6">
          <BrandLockup size="sm" />
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/demo"
              className="rounded-[var(--radius-pill)] border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--field)] transition hover:border-[var(--leaf)] hover:text-[var(--leaf-dark)] sm:px-4"
            >
              Try Demo
            </Link>
            <Link
              href="/login"
              className="rounded-[var(--radius-pill)] border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--field)] transition hover:border-[var(--leaf)] hover:text-[var(--leaf-dark)] sm:px-4"
            >
              Owner login
            </Link>
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <LandingFooter />
    </div>
  );
}
