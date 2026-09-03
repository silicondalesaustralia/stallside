import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { dashCtaClass } from "@/components/DashPrimaryCta";
import { issueGiftCardAction } from "./actions";

export default async function GiftCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ issued?: string }>;
}) {
  const { owner } = await requireOwner();
  const { issued } = await searchParams;
  const currency = owner.billingCurrency || "AUD";

  const cards = await prisma.giftCard.findMany({
    where: { ownerId: owner.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return (
    <main className="flex flex-col gap-8">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/marketing" className="underline">
            Grow
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Gift cards
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          Issue store credit. Codes are shown once at creation.
        </p>
      </div>

      {issued ? (
        <div className="dash-card border-[var(--leaf)] p-4 text-sm">
          <p className="font-semibold text-[var(--leaf-dark)]">
            Gift card issued — copy this code now
          </p>
          <p className="mt-2 font-mono text-lg tracking-wide">{issued}</p>
          <p className="mt-1 text-[var(--muted)]">
            It won&apos;t be shown in full again on this list.
          </p>
        </div>
      ) : null}

      <form
        action={issueGiftCardAction}
        className="dash-card flex max-w-md flex-col gap-4 p-5"
      >
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Amount ($)</span>
          <input
            name="amount"
            type="number"
            min={1}
            step="0.01"
            required
            defaultValue="25"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Note (optional)</span>
          <input
            name="note"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
          />
        </label>
        <button type="submit" className={dashCtaClass}>
          Issue gift card
        </button>
      </form>

      <section>
        <h2 className="text-lg font-semibold">Recent</h2>
        {cards.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">No gift cards yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {cards.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap justify-between gap-2 py-3 text-sm"
              >
                <span className="font-mono tracking-wide">
                  {maskCode(c.code)}
                </span>
                <span className="text-[var(--muted)]">
                  {formatMoney(c.balanceCents, c.currency || currency)} left
                  {" · "}
                  of {formatMoney(c.initialCents, c.currency || currency)}
                  {!c.isActive ? " · inactive" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function maskCode(code: string): string {
  if (code.length <= 4) return "••••";
  return `${"•".repeat(Math.max(4, code.length - 4))}${code.slice(-4)}`;
}
