import Link from "next/link";
import { CARD_PLAN_CENTS, CASH_PLAN_CENTS } from "@/lib/constants";
import { formatMoney } from "@/lib/money";

export default function PricingTiers() {
  return (
    <section id="pricing" className="mx-auto w-full max-w-6xl px-6 py-16">
      <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
        Simple pricing. We never touch your sales.
      </h2>
      <p className="mt-4 max-w-xl text-lg font-semibold text-[var(--marigold)]">
        No percentage of your sales — on either plan, ever.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] px-6 py-8 sm:px-8">
          <p className="text-sm font-semibold text-[var(--leaf-dark)]">Cash · live</p>
          <p className="mt-3 font-receipt text-4xl font-semibold text-[var(--field)]">
            {formatMoney(CASH_PLAN_CENTS, "AUD")}
            <span className="text-lg font-normal text-[var(--muted)]">/mo per site</span>
          </p>
          <ul className="mt-5 space-y-2 text-sm text-[var(--muted)]">
            <li>Take cash. Track stock. Print QR.</li>
            <li>Set up in 2 minutes. No ABN, no bank details.</li>
          </ul>
          <Link
            href="/login"
            className="mt-8 inline-flex rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
          >
            Start free — 30 days
          </Link>
        </div>

        <div className="rounded-[var(--radius)] border border-dashed border-[var(--line)] bg-[var(--wash)] px-6 py-8 sm:px-8">
          <p className="text-sm font-semibold text-[var(--muted)]">
            Card · <span className="text-[var(--warn)]">Coming soon</span>
          </p>
          <p className="mt-3 font-receipt text-4xl font-semibold text-[var(--field)]">
            {formatMoney(CARD_PLAN_CENTS, "AUD")}
            <span className="text-lg font-normal text-[var(--muted)]">/mo per site</span>
          </p>
          <ul className="mt-5 space-y-2 text-sm text-[var(--muted)]">
            <li>Everything in Cash, plus Tap &amp; Go, Apple Pay &amp; Google Pay.</li>
            <li>No terminal. No hardware. No percentage of your sales.</li>
          </ul>
          <a
            href="mailto:hello@stallside.app?subject=Card%20plan%20waitlist"
            className="mt-8 inline-flex rounded-[var(--radius-pill)] border border-[var(--field)] px-5 py-3 text-sm font-semibold text-[var(--field)] transition hover:bg-[var(--panel)]"
          >
            Join the waitlist
          </a>
        </div>
      </div>

      <p className="mt-8 text-sm text-[var(--muted)]">
        30 days free. Cancel any time. No transaction fees, on either plan, ever.
      </p>
    </section>
  );
}
