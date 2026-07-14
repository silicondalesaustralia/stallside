import Link from "next/link";
import { CARD_PLAN_CENTS, CASH_PLAN_CENTS } from "@/lib/constants";
import { formatMoney } from "@/lib/money";

export default function PricingTiers() {
  return (
    <section id="pricing" className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
      <div className="relative mb-8">
        <div
          aria-hidden
          className="absolute left-0 top-0 size-8 border-l-2 border-t-2 border-[var(--field)]/35"
          style={{ borderTopLeftRadius: 8 }}
        />
        <h2 className="pl-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--field)] sm:text-4xl">
          Simple pricing. We never touch your sales.
        </h2>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
        <div className="rounded-[var(--radius)] border-2 border-[var(--leaf)] bg-[var(--panel)] p-[var(--pad-lg)]">
          <p className="text-sm font-semibold text-[var(--leaf)]">Cash — live</p>
          <p className="mt-3 font-receipt text-4xl font-semibold text-[var(--marigold)]">
            {formatMoney(CASH_PLAN_CENTS, "AUD")}
            <span className="text-base font-normal text-[var(--muted)]"> /mo per site</span>
          </p>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Take cash. Track stock. Print QR posters. Sale and low-stock alerts.
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Set up in two minutes. No ABN, no bank details.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex rounded-[var(--radius-pill)] bg-[var(--leaf)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
          >
            Start free — 30 days
          </Link>
        </div>

        <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-[var(--pad-lg)]">
          <p className="text-sm font-semibold text-[var(--ink)]">
            Card —{" "}
            <span className="rounded-full border border-[var(--line)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]">
              Coming soon
            </span>
          </p>
          <p className="mt-3 font-receipt text-4xl font-semibold text-[var(--marigold)]">
            {formatMoney(CARD_PLAN_CENTS, "AUD")}
            <span className="text-base font-normal text-[var(--muted)]"> /mo per site</span>
          </p>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Everything in Cash, plus Tap &amp; Go, Apple Pay and Google Pay at your gate.
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--marigold)]">
            No terminal. No hardware. No percentage of your sales.
          </p>
          <a
            href="mailto:hello@stallside.app?subject=Card%20plan%20waitlist"
            className="mt-8 inline-flex rounded-[var(--radius-pill)] border border-[var(--field)] px-5 py-3 text-sm font-semibold text-[var(--field)] transition hover:bg-[var(--wash)]"
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
