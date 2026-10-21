import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { publicStandBranding } from "@/lib/public-stand-branding";
import { standAccentStyle } from "@/lib/stand-brand";
import { intervalLabel, subscriptionOfferPath } from "@/lib/subscription-offer";
import { standSectionMetadata } from "@/lib/stand-seo";
import { loadSubscriptionOffer } from "@/lib/storefront/views/load-subscription-offer";
import StandStoreHeader from "../../StandStoreHeader";
import SubscriptionOfferContent from "./SubscriptionOfferContent";
import { redirectLegacyStandToWebsite } from "@/lib/storefront/legacy-stand-redirect";

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
  await redirectLegacyStandToWebsite(standSlug, { kind: "subscription", offerSlug });
  const sp = await searchParams;
  const data = await loadSubscriptionOffer({ standSlug, offerSlug });
  if (!data) notFound();
  const stand = await prisma.stand.findFirst({
    where: { slug: data.standSlug },
    include: { owner: true },
  });
  if (!stand) notFound();
  const branded = publicStandBranding(stand, stand.owner);

  return (
    <div style={standAccentStyle(branded.accentColor, branded.secondaryColor)} className="min-h-dvh bg-[var(--bg)]">
      <StandStoreHeader standName={branded.name} standSlug={stand.slug} logoUrl={branded.logoUrl} />
      <main className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <SubscriptionOfferContent data={data} cancelled={Boolean(sp.cancelled)} />
      </main>
    </div>
  );
}
