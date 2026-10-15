import type { Metadata } from "next";
import PublicSubscriptionOfferPage from "@/app/s/[standSlug]/sub/[offerSlug]/page";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import { prisma } from "@/lib/prisma";
import { buildStorefrontPageMetadata, seoConfigSource } from "@/lib/studio/resolve-seo-metadata";
import StorefrontJsonLd from "@/components/storefront/StorefrontJsonLd";
import { subscriptionPageSeo } from "@/lib/seo/subscription-page-seo";

type Props = {
  params: Promise<{ slug: string; offer: string }>;
  searchParams: Promise<{ draft?: string; cancelled?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug, offer } = await params;
  const draft = (await searchParams).draft === "1";
  const ctx = await loadStorefrontPage(slug, draft);
  const row = await prisma.subscriptionOffer.findFirst({
    where: { standId: ctx.stand.id, slug: decodeURIComponent(offer).trim().toLowerCase(), isActive: true },
    select: { id: true, slug: true, title: true, description: true, imageUrl: true },
  });
  if (!row) return { title: "Subscription", robots: { index: false, follow: false } };
  const published = ctx.storefront.isPublished && !draft;
  return buildStorefrontPageMetadata({
    branding: ctx.branding,
    slug: ctx.storefront.slug,
    published,
    configRaw: seoConfigSource(ctx.storefront.draftConfig, ctx.storefront.publishedConfig, published),
    entityType: "subscription",
    entityId: row.id,
    defaults: {
      title: row.title,
      description: row.description?.trim() || `${row.title} from ${ctx.branding.headline}`,
      ogImageUrl: row.imageUrl,
    },
    path: `/subscriptions/${encodeURIComponent(row.slug)}`,
  });
}

/** A subscription offer on the website (`/subscriptions/{offer}`); sign-up and payment work as on the stand page. */
export default async function StorefrontSubscriptionOfferPage({ params, searchParams }: Props) {
  const { slug, offer } = await params;
  const draft = (await searchParams).draft === "1";
  const ctx = await loadStorefrontPage(slug, draft);
  const row = await prisma.subscriptionOffer.findFirst({
    where: { standId: ctx.stand.id, slug: decodeURIComponent(offer).trim().toLowerCase(), isActive: true },
    select: { slug: true, title: true, description: true, imageUrl: true, priceCents: true, interval: true },
  });
  return (
    <>
      {row ? <StorefrontJsonLd ctx={ctx} draft={draft} seo={subscriptionPageSeo(ctx, row)} /> : null}
      <PublicSubscriptionOfferPage
        params={Promise.resolve({ standSlug: ctx.stand.slug, offerSlug: offer })}
        searchParams={searchParams}
      />
    </>
  );
}
