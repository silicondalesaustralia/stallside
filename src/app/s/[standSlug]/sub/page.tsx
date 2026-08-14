import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { publicStandBranding } from "@/lib/public-stand-branding";
import { standAccentStyle } from "@/lib/stand-brand";
import { formatMoney } from "@/lib/money";
import {
  intervalLabel,
  subscriptionOfferPath,
} from "@/lib/subscription-offer";
import StandStoreHeader from "../StandStoreHeader";
import ChannelInterestForm from "../ChannelInterestForm";

export const metadata: Metadata = {
  title: "Subscriptions",
};

export default async function PublicSubscriptionsIndexPage({
  params,
}: {
  params: Promise<{ standSlug: string }>;
}) {
  const { standSlug } = await params;
  const slug = decodeURIComponent(standSlug).trim().toLowerCase();
  const stand = await prisma.stand.findUnique({
    where: { slug },
    include: { owner: true },
  });
  if (!stand || !stand.isActive) notFound();

  const offers = await prisma.subscriptionOffer.findMany({
    where: { standId: stand.id, isActive: true, stripePriceId: { not: null } },
    orderBy: { title: "asc" },
    select: {
      slug: true,
      title: true,
      description: true,
      interval: true,
      priceCents: true,
      currency: true,
    },
  });

  const branded = publicStandBranding(stand, stand.owner);

  return (
    <main
      className="mx-auto min-h-full w-full max-w-lg px-4 pb-10 pt-8"
      style={standAccentStyle(branded.accentColor, branded.secondaryColor)}
    >
      <StandStoreHeader
        standName={stand.name}
        standSlug={stand.slug}
        logoUrl={branded.logoUrl}
      />
      <h2 className="mt-8 text-2xl font-semibold tracking-tight">
        Subscriptions
      </h2>
      {offers.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5">
          <p className="font-medium">No subscriptions available</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            A subscription is a repeating box billed weekly, fortnightly, or
            monthly by card. You can skip a cycle, pause, or cancel from a
            manage link in your email. Nothing is listed here right now.
          </p>
          <ChannelInterestForm standSlug={stand.slug} kind="SUBSCRIPTION" />
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {offers.map((offer) => (
            <li key={offer.slug}>
              <Link
                href={subscriptionOfferPath(stand.slug, offer.slug)}
                className="block rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"
              >
                <p className="font-medium">{offer.title}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {intervalLabel(offer.interval)} ·{" "}
                  {formatMoney(offer.priceCents, offer.currency)}
                </p>
                {offer.description ? (
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {offer.description}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
