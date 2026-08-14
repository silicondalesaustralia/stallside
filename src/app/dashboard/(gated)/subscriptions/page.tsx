import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import NoBusinessYet from "@/components/NoBusinessYet";
import { resolveSelectedBusiness } from "@/lib/selected-business";
import {
  intervalLabel,
  subscriptionOfferPath,
} from "@/lib/subscription-offer";
import { formatMoney } from "@/lib/money";
import { SITE_URL } from "@/lib/legal";

export default async function SubscriptionsListPage() {
  const { owner } = await requireOwner();
  const { selected } = await resolveSelectedBusiness(owner.id);

  if (!selected) {
    return (
      <main className="flex flex-col gap-8">
        <h1 className="text-3xl font-semibold tracking-tight">Subscriptions</h1>
        <NoBusinessYet />
      </main>
    );
  }

  const offers = await prisma.subscriptionOffer.findMany({
    where: { standId: selected.id, ownerId: owner.id },
    orderBy: [{ title: "asc" }],
    include: {
      _count: { select: { items: true, subscriptions: true } },
    },
  });

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Subscriptions
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            {selected.name} — recurring boxes from your catalog. Card via
            Stripe Connect.
          </p>
        </div>
        <Link
          href="/dashboard/subscriptions/new"
          className="rounded-lg bg-[var(--leaf)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]"
        >
          New subscription
        </Link>
      </div>

      {offers.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No subscription offers yet. Pick products, set a cadence, share the
          link.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {offers.map((offer) => {
            const path = subscriptionOfferPath(selected.slug, offer.slug);
            return (
              <li
                key={offer.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {offer.title}
                    {!offer.isActive ? (
                      <span className="ml-2 text-[var(--muted)]">(off)</span>
                    ) : null}
                    {!offer.stripePriceId ? (
                      <span className="ml-2 text-[var(--warn)]">
                        (needs Stripe sync)
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-[var(--muted)]">
                    {intervalLabel(offer.interval)} ·{" "}
                    {formatMoney(offer.priceCents, offer.currency)} ·{" "}
                    {offer._count.items} products ·{" "}
                    {offer._count.subscriptions} subscribers
                  </p>
                  <p className="mt-1 break-all text-xs text-[var(--muted)]">
                    {SITE_URL}
                    {path}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/dashboard/subscriptions/${offer.id}`}
                    className="text-[var(--leaf-dark)] underline"
                  >
                    Edit
                  </Link>
                  <Link
                    href={path}
                    target="_blank"
                    className="text-[var(--leaf-dark)] underline"
                  >
                    Open
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
