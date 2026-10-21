import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PreOrderListBody from "@/app/s/[standSlug]/pre/PreOrderListBody";
import StudioPreOrderListBlock from "@/components/studio/blocks/StudioPreOrderListBlock";
import CommerceLayoutView from "@/lib/storefront/views/CommerceLayoutView";
import { loadPreOrderList } from "@/lib/storefront/views/load-offer-lists";
import { COMMERCE_PREORDERS_KEY } from "@/lib/studio/commerce-pages";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import { shopPreOrdersPath } from "@/lib/storefront/paths";
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
    title: `Pre-orders | ${ctx.stand.name}`,
    description: `Pre-orders from ${ctx.stand.name}.`,
  };
}

/** Every open pre-order page, in the seller's pre-orders category layout with the site menu and footer. */
export default async function StorefrontPreOrdersPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const draft = (await searchParams).draft === "1";
  const ctx = await loadStorefrontPage(slug, draft);
  const basePath = await currentStorefrontBasePath(ctx.storefront.slug);
  const data = await loadPreOrderList(ctx.stand.id, shopPreOrdersPath(ctx.storefront.slug, false, basePath));
  if (!data) notFound();
  return (
    <CommerceLayoutView
      ctx={ctx}
      draft={draft}
      activePage="pre-orders"
      pageKey={COMMERCE_PREORDERS_KEY}
      commerceContext={{ kind: "preorders", ownerId: ctx.owner.id, preOrderList: data }}
      renderBlock={(metadata) => <StudioPreOrderListBlock metadata={metadata} />}
      fallback={<PreOrderListBody data={data} />}
      seo={simplePageSeo(ctx, "/pre-orders", "Pre-orders", { type: "CollectionPage" })}
    />
  );
}
