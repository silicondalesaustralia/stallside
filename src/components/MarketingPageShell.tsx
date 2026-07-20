import type { ReactNode } from "react";
import Link from "next/link";
import BrandLockup from "@/components/BrandLockup";
import LandingFooter from "@/components/LandingFooter";
import OwnerAuthLink from "@/components/OwnerAuthLink";

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
              className="rounded-[var(--radius-pill)] bg-[var(--leaf)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--leaf-dark)] sm:px-4"
            >
              Try Demo
            </Link>
            <OwnerAuthLink variant="marketing" />
          </div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <LandingFooter />
    </div>
  );
}
