import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  intervalLabel,
  subscriptionOfferPath,
  subscriptionManageUrl,
} from "@/lib/subscription-offer";
import { formatMoney } from "@/lib/money";
import { SITE_URL } from "@/lib/legal";
import SubscriptionOfferForm from "../SubscriptionOfferForm";

export default async function EditSubscriptionOfferPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  const { owner } = await requireOwner();

  const offer = await prisma.subscriptionOffer.findFirst({
    where: { id: offerId, ownerId: owner.id },
    include: {
      stand: { select: { slug: true, name: true, currency: true } },
      items: true,
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });
  if (!offer) notFound();

  const products = await prisma.product.findMany({
    where: {
      standId: offer.standId,
      ownerId: owner.id,
      isArchived: false,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, priceCents: true },
  });

  const stripeConnected = Boolean(
    owner.stripeAccountId && owner.stripeChargesEnabled,
  );
  const quantities: Record<string, number> = {};
  for (const item of offer.items) {
    quantities[item.productId] = item.quantity;
  }
  const path = subscriptionOfferPath(offer.stand.slug, offer.slug);

  return (
    <main className="flex flex-col gap-10">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/subscriptions" className="underline">
            Subscriptions
          </Link>
          {" · "}
          {offer.stand.name}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {offer.title}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {intervalLabel(offer.interval)} ·{" "}
          {formatMoney(offer.priceCents, offer.currency)} ·{" "}
          <a href={path} className="underline" target="_blank" rel="noreferrer">
            {SITE_URL}
            {path}
          </a>
        </p>
      </div>

      <SubscriptionOfferForm
        products={products}
        stripeConnected={stripeConnected}
        currency={offer.stand.currency}
        values={{
          id: offer.id,
          title: offer.title,
          slug: offer.slug,
          description: offer.description,
          isActive: offer.isActive,
          interval: offer.interval,
          handoverMode: offer.handoverMode,
          collectionWeekday: offer.collectionWeekday,
          collectionNote: offer.collectionNote,
          productIds: offer.items.map((i) => i.productId),
          quantities,
        }}
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Subscribers</h2>
        {offer.subscriptions.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No subscribers yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)] text-sm">
            {offer.subscriptions.map((sub) => (
              <li
                key={sub.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div>
                  <p className="font-medium">{sub.customerName}</p>
                  <p className="text-[var(--muted)]">
                    {sub.customerEmail} · {sub.status.toLowerCase()}
                    {sub.nextCollectionAt
                      ? ` · next ${sub.nextCollectionAt.toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <a
                  href={subscriptionManageUrl(offer.stand.slug, sub.manageToken)}
                  className="text-[var(--leaf-dark)] underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Manage link
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
