import Link from "next/link";
import type { VendlFeeEconomics } from "@/lib/vendl-fee-economics";

export default function ProEconomicsCard({
  economics,
}: {
  economics: VendlFeeEconomics;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[var(--dash-shadow)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
        Vendl fees
      </p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--field)]">
        You&apos;ve paid {economics.feesFormatted} in Vendl fees this month
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Vendl Pro is {economics.proPriceFormatted}/mo and removes the Vendl
        transaction fee. Estimated run-rate from this month:{" "}
        {economics.annualisedFormatted}/yr in fees.
      </p>
      {economics.proMaySave ? (
        <p className="mt-2 text-sm font-semibold text-[var(--leaf)]">
          At your current sales volume, Pro may cost less than transaction fees
          (about {economics.savingFormatted}/yr difference).
        </p>
      ) : (
        <p className="mt-2 text-sm text-[var(--muted)]">
          At this volume, Free may still be cheaper than Pro — upgrade when fees
          approach the Pro price.
        </p>
      )}
      <Link
        href="/dashboard/settings/billing"
        className="mt-4 inline-flex rounded-full bg-[var(--leaf)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--leaf-dark)]"
      >
        Compare Free and Pro
      </Link>
    </div>
  );
}
