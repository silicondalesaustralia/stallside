import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import { prisma } from "@/lib/prisma";
import { buildStorefrontPageMetadata, seoConfigSource } from "@/lib/studio/resolve-seo-metadata";
import { subscriptionPageSeo } from "@/lib/seo/subscription-page-seo";
import { COMMERCE_SUBSCRIPTION_KEY } from "@/lib/studio/commerce-pages";
import CommerceLayoutView from "@/lib/storefront/views/CommerceLayoutView";
import { loadSubscriptionOffer } from "@/lib/storefront/views/load-subscription-offer";
import StudioSubscriptionBlock from "@/components/studio/blocks/StudioSubscriptionBlock";
import SubscriptionOfferContent from "@/app/s/[standSlug]/sub/[offerSlug]/SubscriptionOfferContent";

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

/** A subscription or membership offer on the website, in the seller's subscription layout with the site menu and footer. */
export default async function StorefrontSubscriptionOfferPage({ params, searchParams }: Props) {
  const { slug, offer } = await params;
  const sp = await searchParams;
  const draft = sp.draft === "1";
  const ctx = await loadStorefrontPage(slug, draft);
  const data = await loadSubscriptionOffer({ standId: ctx.stand.id, offerSlug: offer });
  if (!data) notFound();
  const cancelled = Boolean(sp.cancelled);

  return (
    <CommerceLayoutView
      ctx={ctx}
      draft={draft}
      activePage="subscriptions"
      pageKey={COMMERCE_SUBSCRIPTION_KEY}
      commerceContext={{ kind: "subscription", ownerId: ctx.owner.id, subscription: data, cancelled }}
      renderBlock={(metadata) => <StudioSubscriptionBlock metadata={metadata} />}
      fallback={
        <div className="storefront-page-content storefront-page-content--narrow">
          <SubscriptionOfferContent data={data} cancelled={cancelled} />
        </div>
      }
      seo={subscriptionPageSeo(ctx, {
        slug: data.offer.slug,
        title: data.offer.title,
        description: data.offer.description,
        imageUrl: data.offer.imageUrl,
        priceCents: data.offer.priceCents,
        interval: data.offer.interval,
      })}
    />
  );
}
