import type { ReactNode } from "react";
import Link from "next/link";
import BrandLockup from "@/components/BrandLockup";
import LandingFooter from "@/components/LandingFooter";
import LifetimePromoTicker from "@/components/LifetimePromoTicker";
import MarketingNavLinks from "@/components/MarketingNavLinks";
import OwnerAuthLink from "@/components/OwnerAuthLink";

export default function MarketingPageShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-[var(--wash)]">
      <LifetimePromoTicker />
      <header className="border-b border-[var(--line)] bg-[var(--panel)]/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 flex-1 items-center gap-6">
            <BrandLockup size="sm" />
            <MarketingNavLinks />
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <Link
              href="/demo"
              className="rounded-[var(--radius-pill)] bg-[var(--leaf)] px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-white transition hover:bg-[var(--leaf-dark)] sm:px-4 sm:py-2 sm:text-sm"
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
