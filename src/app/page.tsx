import Link from "next/link";
import BrandLockup from "@/components/BrandLockup";
import LandingHero from "@/components/LandingHero";
import { APP_DOMAIN, MONTHLY_FEE_CENTS } from "@/lib/constants";
import { formatMoney } from "@/lib/money";

export default function HomePage() {
  return (
    <main className="relative flex min-h-full flex-1 flex-col">
      <LandingHero />

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="max-w-2xl font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          Print a QR. Customers scan and pay. You watch stock from anywhere.
        </h2>
        <ul className="mt-8 grid gap-6 text-[var(--muted)] sm:grid-cols-3">
          <li className="border-t-2 border-[var(--leaf)] pt-4">
            One QR per stand — cash or card / Apple Pay / Google Pay.
          </li>
          <li className="border-t-2 border-[var(--marigold)] pt-4">
            Inventory updates the moment a sale is confirmed.
          </li>
          <li className="border-t-2 border-[var(--field)] pt-4">
            Restock from your phone while you&apos;re at the stall.
          </li>
        </ul>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-6 py-10 sm:px-10">
          <p className="text-sm uppercase tracking-wide text-[var(--muted)]">Simple pricing</p>
          <p className="mt-3 font-receipt text-4xl font-semibold text-[var(--field)]">
            {formatMoney(MONTHLY_FEE_CENTS, "AUD")}
            <span className="text-lg font-normal text-[var(--muted)]">/mo</span>
          </p>
          <p className="mt-3 max-w-lg text-[var(--muted)]">
            Unlimited stands and products. 2% tracked on card sales only — no Connect skim in MVP.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
          >
            Get started
          </Link>
        </div>
      </section>

      <footer className="bg-[var(--field)] px-6 py-10 text-[var(--ink-on-dark)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <BrandLockup variant="dark" href="/" />
          <p className="text-sm text-[var(--ink-on-dark)]/70">{APP_DOMAIN}</p>
        </div>
      </footer>
    </main>
  );
}
