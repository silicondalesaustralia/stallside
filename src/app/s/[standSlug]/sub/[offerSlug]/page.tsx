import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { publicStandBranding } from "@/lib/public-stand-branding";
import { standAccentStyle } from "@/lib/stand-brand";
import { SITE_URL } from "@/lib/legal";
import {
  intervalLabel,
  subscriptionOfferPath,
  weekdayLabel,
} from "@/lib/subscription-offer";
import { formatMoney } from "@/lib/money";
import { standOffersCard } from "@/lib/stand-payment-brands";
import { HandoverMode } from "@/generated/prisma/client";
import StandStoreHeader from "../../StandStoreHeader";
import SubscriptionEnrollForm from "./SubscriptionEnrollForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ standSlug: string; offerSlug: string }>;
}): Promise<Metadata> {
  const { standSlug, offerSlug } = await params;
  const standKey = decodeURIComponent(standSlug).trim().toLowerCase();
  const offerKey = decodeURIComponent(offerSlug).trim().toLowerCase();
  const offer = await prisma.subscriptionOffer.findFirst({
    where: {
      slug: offerKey,
      isActive: true,
      stand: { slug: standKey, isActive: true },
    },
    include: { stand: { select: { name: true, slug: true } } },
  });
  if (!offer) return { title: "Subscription" };
  const title = `${offer.title} · ${offer.stand.name}`;
  const description =
    offer.description?.trim() ||
    `${intervalLabel(offer.interval)} subscription from ${offer.stand.name}.`;
  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}${subscriptionOfferPath(offer.stand.slug, offer.slug)}`,
    },
  };
}

export default async function PublicSubscriptionOfferPage({
  params,
  searchParams,
}: {
  params: Promise<{ standSlug: string; offerSlug: string }>;
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const { standSlug, offerSlug } = await params;
  const sp = await searchParams;
  const standKey = decodeURIComponent(standSlug).trim().toLowerCase();
  const offerKey = decodeURIComponent(offerSlug).trim().toLowerCase();

  const offer = await prisma.subscriptionOffer.findFirst({
    where: {
      slug: offerKey,
      isActive: true,
      stand: { slug: standKey, isActive: true },
    },
    include: {
      stand: { include: { owner: true } },
      items: {
        orderBy: { sortOrder: "asc" },
        include: { product: true },
      },
    },
  });
  if (!offer) notFound();

  const { stand } = offer;
  const branded = publicStandBranding(stand, stand.owner);
  const cardEnabled = standOffersCard(stand, stand.owner);
  const cardOk = cardEnabled && Boolean(offer.stripePriceId);
  const day = weekdayLabel(offer.collectionWeekday);
  const unavailableReason = !cardEnabled
    ? "This stand cannot take card payments yet."
    : !offer.stripePriceId
      ? "This offer is not ready for signup yet. The owner needs to save it again after Stripe is connected."
      : "Card subscriptions are not available for this offer right now.";

  return (
    <div
      style={standAccentStyle(branded.accentColor, branded.secondaryColor)}
      className="min-h-dvh bg-[var(--bg)]"
    >
      <StandStoreHeader
        standName={branded.name}
        standSlug={stand.slug}
        logoUrl={branded.logoUrl}
      />
      <main className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{offer.title}</h1>
          {offer.description ? (
            <p className="mt-2 text-[var(--muted)]">{offer.description}</p>
          ) : null}
          <p className="mt-2 text-sm text-[var(--muted)]">
            {intervalLabel(offer.interval)} ·{" "}
            {formatMoney(offer.priceCents, offer.currency)}
            {day ? ` · ${day} collection` : ""}
            {offer.collectionNote ? ` · ${offer.collectionNote}` : ""}
          </p>
        </div>
        {sp.cancelled ? (
          <p className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm">
            Checkout cancelled. You can try again when ready.
          </p>
        ) : null}
        {cardOk ? (
          <SubscriptionEnrollForm
            standSlug={stand.slug}
            offerSlug={offer.slug}
            title={offer.title}
            interval={offer.interval}
            priceCents={offer.priceCents}
            currency={offer.currency}
            handoverDeliver={offer.handoverMode === HandoverMode.DELIVER}
            lines={offer.items.map((i) => ({
              name: i.product.name,
              quantity: i.quantity,
              lineTotalCents: i.product.priceCents * i.quantity,
            }))}
          />
        ) : (
          <p className="text-sm text-[var(--warn)]">{unavailableReason}</p>
        )}
      </main>
    </div>
  );
}
