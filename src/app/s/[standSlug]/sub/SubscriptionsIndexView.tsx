import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { publicStandBranding } from "@/lib/public-stand-branding";
import { standAccentStyle } from "@/lib/stand-brand";
import { membershipOfferReady } from "@/lib/subscription-offer";
import StandStoreHeader from "../StandStoreHeader";
import ChannelInterestForm from "../ChannelInterestForm";
import MembershipCategoryView from "./MembershipCategoryView";

/** Membership list for a stand; `offerHrefBase` points offer links at the website (`/subscriptions`). */
export default async function SubscriptionsIndexView({
  standSlug,
  offerHrefBase,
}: {
  standSlug: string;
  offerHrefBase?: string;
}) {
  const slug = decodeURIComponent(standSlug).trim().toLowerCase();
  const stand = await prisma.stand.findUnique({
    where: { slug },
    include: { owner: true },
  });
  if (!stand || !stand.isActive) notFound();

  const offers = await prisma.subscriptionOffer.findMany({
    where: { standId: stand.id, isActive: true },
    orderBy: { title: "asc" },
    select: {
      slug: true,
      title: true,
      description: true,
      imageUrl: true,
      currency: true,
      termWeeks: true,
      weeklyPriceCents: true,
      monthlyPriceCents: true,
      upfrontPriceCents: true,
      stripePriceId: true,
      stripeWeeklyPriceId: true,
      stripeMonthlyPriceId: true,
      stripeUpfrontPriceId: true,
      kind: true,
      interval: true,
      priceCents: true,
    },
  });
  const liveOffers = offers.filter((o) => membershipOfferReady(o));
  const branded = publicStandBranding(stand, stand.owner);

  return (
    <div
      className="min-h-dvh w-full"
      style={standAccentStyle(branded.accentColor, branded.secondaryColor)}
    >
      <div className="mx-auto w-full max-w-lg px-4 pb-2 pt-8">
        <StandStoreHeader
          standName={stand.name}
          standSlug={stand.slug}
          logoUrl={branded.logoUrl}
        />
      </div>
      {liveOffers.length === 0 ? (
        <div className="mx-auto mt-4 w-full max-w-lg px-4 pb-10">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5">
            <p className="font-medium">No memberships available</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              A membership is a fixed-term share billed by card. Nothing is
              listed here right now.
            </p>
            <ChannelInterestForm standSlug={stand.slug} kind="SUBSCRIPTION" />
          </div>
        </div>
      ) : (
        <MembershipCategoryView
          standSlug={stand.slug}
          standName={stand.name}
          accentColor={branded.accentColor}
          offers={liveOffers}
          offerHrefBase={offerHrefBase}
        />
      )}
    </div>
  );
}
