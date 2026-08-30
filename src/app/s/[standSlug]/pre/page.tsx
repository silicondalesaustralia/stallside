import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { publicStandBranding } from "@/lib/public-stand-branding";
import { standAccentStyle } from "@/lib/stand-brand";
import { formatCollectionLabel } from "@/lib/pre-order";
import { preOrderPagePath } from "@/lib/preorder-page";
import StandStoreHeader from "../StandStoreHeader";
import ChannelInterestForm from "../ChannelInterestForm";

export const metadata: Metadata = {
  title: "Pre-orders",
};

export default async function PublicPreOrdersIndexPage({
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

  const pages = await prisma.preOrderPage.findMany({
    where: {
      standId: stand.id,
      isActive: true,
      orderByAt: { gte: new Date() },
    },
    orderBy: { collectionAt: "asc" },
    select: {
      slug: true,
      title: true,
      collectionAt: true,
      description: true,
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
        locationLabel={stand.locationLabel}
      />
      <h2 className="mt-8 text-2xl font-semibold tracking-tight">Pre-orders</h2>
      {pages.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5">
          <p className="font-medium">No pre-orders available</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            Pre-orders let you pay by card for a collection or delivery day.
            The stall packs your order; you pick it up (or they deliver) on
            that day. Nothing is listed here right now.
          </p>
          <ChannelInterestForm standSlug={stand.slug} kind="PREORDER" />
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {pages.map((page) => (
            <li key={page.slug}>
              <Link
                href={preOrderPagePath(stand.slug, page.slug)}
                className="block rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"
              >
                <p className="font-medium">{page.title}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Collect {formatCollectionLabel(page.collectionAt, stand.timezone)}
                </p>
                {page.description ? (
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {page.description}
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
