import Link from "next/link";
import { formatMoney } from "@/lib/money";

export default function StarterUpgradeSignals({
  cardInterestCount,
  cardInterestCents,
  currency,
  restockSubscriberCount,
}: {
  cardInterestCount: number;
  cardInterestCents: number;
  currency: string;
  restockSubscriberCount: number;
}) {
  if (cardInterestCount === 0 && restockSubscriberCount === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      {cardInterestCount > 0 ? (
        <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-5">
          <h2 className="text-lg font-semibold">Card demand this month</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {cardInterestCount}{" "}
            {cardInterestCount === 1 ? "person" : "people"} wanted to pay by
            card
            {cardInterestCents > 0
              ? ` - about ${formatMoney(cardInterestCents, currency)}`
              : ""}
            .
          </p>
          <Link
            href="/dashboard/settings/billing"
            className="mt-3 inline-flex text-sm font-semibold text-[var(--leaf-dark)] underline"
          >
            Upgrade to Pro for Tap &amp; Go
          </Link>
        </div>
      ) : null}
      {restockSubscriberCount > 0 ? (
        <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-5">
          <h2 className="text-lg font-semibold">Restock list growing</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {restockSubscriberCount}{" "}
            {restockSubscriberCount === 1 ? "regular is" : "regulars are"}{" "}
            waiting to hear when you restock. Upgrade to notify them.
          </p>
          <Link
            href="/dashboard/settings/billing"
            className="mt-3 inline-flex text-sm font-semibold text-[var(--leaf-dark)] underline"
          >
            Upgrade to Pro to notify
          </Link>
        </div>
      ) : null}
    </section>
  );
}
