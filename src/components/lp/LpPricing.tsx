import LpStartFreeLink from "@/components/lp/LpStartFreeLink";

const INCLUDED = [
  "Printable QR poster",
  "Cash, PayID, card and digital wallets",
  "Sale alerts and live stock tracking",
  "Pre-orders and restock notifications",
  "Your own stall branding",
] as const;

export default function LpPricing() {
  return (
    <section className="px-5 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl rounded-[var(--radius)] bg-[var(--field)] px-6 py-8 text-[var(--ink-on-dark)] shadow-lg sm:px-10 sm:py-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--marigold)]">
          Start free. Pay only when a card sale is made.
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight sm:text-3xl">
          A$0 per month, with every Vendl feature.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-[var(--ink-on-dark)]/85 sm:text-base">
          Cash and PayID have no Vendl fee. Card, Tap &amp; Go and pay-later
          sales on Free include a 2.5% Vendl fee, plus standard Stripe
          processing fees.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ink-on-dark)]/85 sm:text-base">
          You can absorb the Vendl fee or pass it on to customers. Upgrade
          to Pro later to remove it.
        </p>
        <ul className="mt-6 space-y-2">
          {INCLUDED.map((item) => (
            <li key={item} className="flex gap-2 text-sm">
              <span aria-hidden className="text-[var(--marigold)]">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col items-start gap-2">
          <LpStartFreeLink
            placement="pricing"
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--marigold)] px-6 py-3 text-base font-semibold text-[var(--field)] transition hover:brightness-105"
          />
          <p className="text-sm text-[var(--ink-on-dark)]/70">
            No card details required · No monthly commitment
          </p>
          <a
            href="/#pricing"
            className="mt-1 text-sm font-semibold text-[var(--ink-on-dark)] underline underline-offset-2 opacity-80 hover:opacity-100"
          >
            View full pricing and fees
          </a>
        </div>
      </div>
    </section>
  );
}
