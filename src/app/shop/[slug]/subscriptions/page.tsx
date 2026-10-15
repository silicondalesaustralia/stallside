import type { Metadata } from "next";
import SubscriptionsIndexView from "@/app/s/[standSlug]/sub/SubscriptionsIndexView";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import { shopSubscriptionsPath } from "@/lib/storefront/paths";
import { currentStorefrontBasePath } from "@/lib/tenancy/request-base-path";
import StorefrontJsonLd from "@/components/storefront/StorefrontJsonLd";
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

export default async function StorefrontSubscriptionsPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const draft = (await searchParams).draft === "1";
  const ctx = await loadStorefrontPage(slug, draft);
  const basePath = await currentStorefrontBasePath(ctx.storefront.slug);
  return (
    <>
      <StorefrontJsonLd
        ctx={ctx}
        draft={draft}
        seo={simplePageSeo(ctx, "/subscriptions", "Memberships", { type: "CollectionPage" })}
      />
      <SubscriptionsIndexView
        standSlug={ctx.stand.slug}
        offerHrefBase={shopSubscriptionsPath(ctx.storefront.slug, undefined, false, basePath)}
      />
    </>
  );
}
