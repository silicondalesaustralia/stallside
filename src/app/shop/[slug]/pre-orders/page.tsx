import type { Metadata } from "next";
import PreOrdersIndexView from "@/app/s/[standSlug]/pre/PreOrdersIndexView";
import StorefrontPageShell from "@/components/storefront/StorefrontPageShell";
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

/** Every open pre-order page, with the site menu and footer. */
export default async function StorefrontPreOrdersPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const draft = (await searchParams).draft === "1";
  const ctx = await loadStorefrontPage(slug, draft);
  const basePath = await currentStorefrontBasePath(ctx.storefront.slug);
  return (
    <StorefrontPageShell
      ctx={ctx}
      draft={draft}
      activePage="pre-orders"
      seo={simplePageSeo(ctx, "/pre-orders", "Pre-orders", { type: "CollectionPage" })}
    >
      <PreOrdersIndexView
        standSlug={ctx.stand.slug}
        pageHrefBase={shopPreOrdersPath(ctx.storefront.slug, false, basePath)}
        standHeader={false}
      />
    </StorefrontPageShell>
  );
}
