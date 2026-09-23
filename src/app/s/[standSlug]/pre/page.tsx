import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { publicStandBranding } from "@/lib/public-stand-branding";
import { standAccentStyle } from "@/lib/stand-brand";
import {
  standPreOrdersPath,
  standSectionMetadata,
} from "@/lib/stand-seo";
import StandStoreHeader from "../StandStoreHeader";
import ChannelInterestForm from "../ChannelInterestForm";
import PreOrderCategoryView from "./PreOrderCategoryView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ standSlug: string }>;
}): Promise<Metadata> {
  const { standSlug } = await params;
  const slug = decodeURIComponent(standSlug).trim().toLowerCase();
  const stand = await prisma.stand.findUnique({
    where: { slug },
    select: {
      name: true,
      slug: true,
      logoUrl: true,
      ogImageUrl: true,
      isActive: true,
    },
  });
  if (!stand || !stand.isActive) return { title: "Pre-orders" };
  return standSectionMetadata({
    standName: stand.name,
    standSlug: stand.slug,
    sectionTitle: "Pre-orders",
    description: `Pre-orders from ${stand.name}.`,
    path: standPreOrdersPath(stand.slug),
    logoUrl: stand.logoUrl,
    ogImageUrl: stand.ogImageUrl,
  });
}

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
      orderByAt: true,
      description: true,
      imageUrl: true,
      handoverMode: true,
      items: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: {
          product: { select: { imageUrl: true } },
        },
      },
    },
  });

  const branded = publicStandBranding(stand, stand.owner);
  const cards = pages.map((page) => ({
    slug: page.slug,
    title: page.title,
    description: page.description,
    imageUrl: page.imageUrl,
    collectionAt: page.collectionAt,
    orderByAt: page.orderByAt,
    handoverMode: page.handoverMode,
    fallbackImageUrl: page.items[0]?.product.imageUrl ?? null,
  }));

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
          locationLabel={stand.locationLabel}
        />
      </div>
      {cards.length === 0 ? (
        <div className="mx-auto mt-4 w-full max-w-lg px-4 pb-10">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5">
            <p className="font-medium">No pre-orders available</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              Pre-orders let you pay by card for a collection or delivery day.
              The stall packs your order; you pick it up (or they deliver) on
              that day. Nothing is listed here right now.
            </p>
            <ChannelInterestForm standSlug={stand.slug} kind="PREORDER" />
          </div>
        </div>
      ) : (
        <PreOrderCategoryView
          standSlug={stand.slug}
          standName={stand.name}
          timezone={stand.timezone}
          accentColor={branded.accentColor}
          pages={cards}
        />
      )}
    </div>
  );
}
