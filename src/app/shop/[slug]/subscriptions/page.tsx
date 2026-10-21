import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SubscriptionListBody from "@/app/s/[standSlug]/sub/SubscriptionListBody";
import StudioSubscriptionListBlock from "@/components/studio/blocks/StudioSubscriptionListBlock";
import CommerceLayoutView from "@/lib/storefront/views/CommerceLayoutView";
import { loadSubscriptionList } from "@/lib/storefront/views/load-offer-lists";
import { COMMERCE_SUBSCRIPTIONS_KEY } from "@/lib/studio/commerce-pages";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import { shopSubscriptionsPath } from "@/lib/storefront/paths";
import { currentStorefrontBasePath } from "@/lib/tenancy/request-base-path";
import { simplePageSeo } from "@/lib/seo/simple-page-seo";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ draft?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ctx = await loadStorefrontPage(slug, (await searchParams).draft === "1");
  return {
    title: `Memberships | ${ctx.stand.name}`,
    description: `Memberships and subscriptions from ${ctx.stand.name}.`,
  };
}

/** Every live offer, in the seller's subscriptions category layout with the site menu and footer. */
export default async function StorefrontSubscriptionsPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const draft = (await searchParams).draft === "1";
  const ctx = await loadStorefrontPage(slug, draft);
  const basePath = await currentStorefrontBasePath(ctx.storefront.slug);
  const href = shopSubscriptionsPath(ctx.storefront.slug, undefined, false, basePath);
  const data = await loadSubscriptionList(ctx.stand.id, href);
  if (!data) notFound();
  return (
    <CommerceLayoutView
      ctx={ctx}
      draft={draft}
      activePage="subscriptions"
      pageKey={COMMERCE_SUBSCRIPTIONS_KEY}
      commerceContext={{ kind: "subscriptions", ownerId: ctx.owner.id, subscriptionList: data }}
      renderBlock={(metadata) => <StudioSubscriptionListBlock metadata={metadata} />}
      fallback={<SubscriptionListBody data={data} />}
      seo={simplePageSeo(ctx, "/subscriptions", "Memberships", { type: "CollectionPage" })}
    />
  );
}
