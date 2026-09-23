import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  intervalLabel,
  membershipOfferReady,
  offerDisplayPriceCents,
  subscriptionOfferPath,
} from "@/lib/subscription-offer";
import { formatMoney } from "@/lib/money";
import { SITE_URL } from "@/lib/legal";
import { productCatalogWhere } from "@/lib/product-visibility";
import { SubscriptionOfferKind } from "@/generated/prisma/client";
import SubscriptionOfferForm from "../SubscriptionOfferForm";
import MembershipOfferForm from "../MembershipOfferForm";
import SubscriptionSubscribersList from "../SubscriptionSubscribersList";
import SubscriptionLifecycleActions from "../SubscriptionLifecycleActions";

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

  if (owner.stripeAccountId) {
    const { healIncompleteShopperSubscription } = await import(
      "@/lib/shopper-subscription-activate"
    );
    for (const sub of offer.subscriptions.filter(
      (s) => s.status === "INCOMPLETE",
    )) {
      try {
        await healIncompleteShopperSubscription({
          shopperSubscriptionId: sub.id,
          stripeAccountId: owner.stripeAccountId,
        });
      } catch (error) {
        console.error("Heal incomplete shopper sub failed", sub.id, error);
      }
    }
  }

  const subscriptions = await prisma.shopperSubscription.findMany({
    where: { offerId: offer.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const selectedProductIds = offer.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      standId: offer.standId,
      ownerId: owner.id,
      OR: [
        productCatalogWhere,
        ...(selectedProductIds.length
          ? [{ id: { in: selectedProductIds } }]
          : []),
      ],
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
  const ready = membershipOfferReady(offer);
  const isMembership = offer.kind === SubscriptionOfferKind.MEMBERSHIP;

  return (
    <main className="flex flex-col gap-10">
      <div>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/dashboard/subscriptions" className="underline">
            Subscriptions
          </Link>
          {" · "}
          {offer.stand.name}
          {isMembership ? " · Membership" : " · Box"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {offer.title}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {isMembership
            ? `${offer.termWeeks ?? "?"} weeks`
            : intervalLabel(offer.interval)}{" "}
          · {formatMoney(offerDisplayPriceCents(offer), offer.currency)} ·{" "}
          {!offer.isActive ? "Off · " : null}
          <a href={path} className="underline" target="_blank" rel="noreferrer">
            {SITE_URL}
            {path}
          </a>
        </p>
        <div className="mt-4">
          <SubscriptionLifecycleActions
            offerId={offer.id}
            offerTitle={offer.title}
            isActive={offer.isActive}
          />
        </div>
      </div>

      {!ready ? (
        <p className="rounded-lg border border-[var(--warn)]/40 bg-[var(--warn)]/10 px-3 py-2 text-sm">
          Stripe price not synced yet — public signup is blocked. Save again
          after Connect charges are enabled.
        </p>
      ) : null}

      {isMembership ? (
        <MembershipOfferForm
          stripeConnected={stripeConnected}
          currency={offer.stand.currency}
          values={{
            id: offer.id,
            title: offer.title,
            slug: offer.slug,
            description: offer.description,
            imageUrl: offer.imageUrl,
            isActive: offer.isActive,
            handoverMode: offer.handoverMode,
            collectionWeekday: offer.collectionWeekday,
            collectionNote: offer.collectionNote,
            termWeeks: offer.termWeeks ?? 26,
            weeklyPriceCents: offer.weeklyPriceCents,
            monthlyPriceCents: offer.monthlyPriceCents,
            upfrontPriceCents: offer.upfrontPriceCents,
            upfrontBenefitsText: offer.upfrontBenefitsText,
            termsText: offer.termsText,
          }}
        />
      ) : (
        <SubscriptionOfferForm
          products={products}
          stripeConnected={stripeConnected}
          currency={offer.stand.currency}
          values={{
            id: offer.id,
            title: offer.title,
            slug: offer.slug,
            description: offer.description,
            imageUrl: offer.imageUrl,
            isActive: offer.isActive,
            interval: offer.interval,
            handoverMode: offer.handoverMode,
            collectionWeekday: offer.collectionWeekday,
            collectionNote: offer.collectionNote,
            productIds: offer.items.map((i) => i.productId),
            quantities,
          }}
        />
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Subscribers</h2>
        {subscriptions.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No subscribers yet.</p>
        ) : (
          <SubscriptionSubscribersList
            standSlug={offer.stand.slug}
            subscriptions={subscriptions}
          />
        )}
      </section>
    </main>
  );
}
