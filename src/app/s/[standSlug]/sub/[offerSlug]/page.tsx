import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { publicStandBranding } from "@/lib/public-stand-branding";
import { standAccentStyle } from "@/lib/stand-brand";
import { standSectionMetadata } from "@/lib/stand-seo";
import {
  intervalLabel,
  membershipOfferReady,
  subscriptionOfferPath,
  weekdayLabel,
  type MembershipPlan,
} from "@/lib/subscription-offer";
import { standOffersCard } from "@/lib/stand-payment-brands";
import {
  HandoverMode,
  SubscriptionOfferKind,
} from "@/generated/prisma/client";
import StandStoreHeader from "../../StandStoreHeader";
import SubscriptionEnrollForm from "./SubscriptionEnrollForm";
import MembershipContentShell from "./MembershipContentShell";
import MembershipEnrollForm from "./MembershipEnrollForm";
import MembershipOfferStory from "./MembershipOfferStory";
import MembershipTermsAccordion from "./MembershipTermsAccordion";

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
    include: {
      stand: {
        select: { name: true, slug: true, logoUrl: true, ogImageUrl: true },
      },
    },
  });
  if (!offer) return { title: "Subscription" };
  return standSectionMetadata({
    standName: offer.stand.name,
    standSlug: offer.stand.slug,
    sectionTitle: offer.title,
    description:
      offer.description?.trim() ||
      `${intervalLabel(offer.interval)} subscription from ${offer.stand.name}.`,
    path: subscriptionOfferPath(offer.stand.slug, offer.slug),
    logoUrl: offer.stand.logoUrl,
    ogImageUrl: offer.stand.ogImageUrl,
    pageImageUrl: offer.imageUrl,
  });
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
  const ready = membershipOfferReady(offer);
  const cardOk = cardEnabled && ready;
  const day = weekdayLabel(offer.collectionWeekday);
  const isMembership = offer.kind === SubscriptionOfferKind.MEMBERSHIP;
  const unavailableReason = !cardEnabled
    ? "This stand cannot take card payments yet."
    : !ready
      ? "This offer is not ready for signup yet. The owner needs to save it again after Stripe is connected."
      : "Card subscriptions are not available for this offer right now.";

  const plans: { plan: MembershipPlan; priceCents: number }[] = [];
  if (isMembership) {
    if (offer.weeklyPriceCents != null && offer.stripeWeeklyPriceId) {
      plans.push({ plan: "WEEKLY", priceCents: offer.weeklyPriceCents });
    }
    if (offer.monthlyPriceCents != null && offer.stripeMonthlyPriceId) {
      plans.push({ plan: "MONTHLY", priceCents: offer.monthlyPriceCents });
    }
    if (offer.upfrontPriceCents != null && offer.stripeUpfrontPriceId) {
      plans.push({ plan: "UPFRONT", priceCents: offer.upfrontPriceCents });
    }
  }

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
      <main className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8 sm:px-6">
        {offer.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={offer.imageUrl}
            alt=""
            className="aspect-[16/9] w-full rounded-xl object-cover"
          />
        ) : null}

        {isMembership ? (
          <MembershipContentShell>
            <MembershipOfferStory
              standName={branded.name}
              title={offer.title}
              description={offer.description}
              currency={offer.currency}
              termWeeks={offer.termWeeks}
              weeklyPriceCents={offer.weeklyPriceCents}
              monthlyPriceCents={offer.monthlyPriceCents}
              upfrontPriceCents={offer.upfrontPriceCents}
              collectionWeekdayLabel={day}
              collectionNote={offer.collectionNote}
              handoverCollect={offer.handoverMode === HandoverMode.COLLECT}
              plans={plans.map((p) => p.plan)}
            />
            {sp.cancelled ? (
              <p className="rounded-lg border border-[var(--m-card-border)] bg-[var(--m-card)] px-3 py-2 text-sm">
                Checkout cancelled. You can try again when ready.
              </p>
            ) : null}
            {cardOk ? (
              <MembershipEnrollForm
                standSlug={stand.slug}
                offerSlug={offer.slug}
                currency={offer.currency}
                plans={plans}
                termWeeks={offer.termWeeks}
                upfrontBenefitsText={offer.upfrontBenefitsText}
                handoverDeliver={offer.handoverMode === HandoverMode.DELIVER}
              />
            ) : (
              <p className="text-sm text-[var(--warn)]">{unavailableReason}</p>
            )}
            {offer.termsText ? (
              <MembershipTermsAccordion text={offer.termsText} />
            ) : null}
          </MembershipContentShell>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {offer.title}
              </h1>
              {offer.description ? (
                <p className="mt-2 whitespace-pre-wrap text-[var(--muted)]">
                  {offer.description}
                </p>
              ) : null}
              <p className="mt-2 text-sm text-[var(--muted)]">
                {intervalLabel(offer.interval)}
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
          </>
        )}
      </main>
    </div>
  );
}
