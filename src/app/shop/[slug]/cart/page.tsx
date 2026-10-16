import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import { loadStandCartData } from "@/lib/storefront/stand-cart-props";
import { appBaseUrl } from "@/lib/app-url";
import { standCatalogPath } from "@/lib/stand-seo";
import { COMMERCE_CART_KEY } from "@/lib/studio/commerce-pages";
import CommerceLayoutView from "@/lib/storefront/views/CommerceLayoutView";
import StudioCartBlock from "@/components/studio/blocks/StudioCartBlock";
import StandCartCheckout from "@/app/s/[standSlug]/StandCartCheckout";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ draft?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ctx = await loadStorefrontPage(slug, (await searchParams).draft === "1");
  return { title: `Cart | ${ctx.stand.name}`, robots: { index: false, follow: false } };
}

/** Cart & checkout on the website, so it shares the site's address (and the shopper's cart). */
export default async function StorefrontCartPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const draft = (await searchParams).draft === "1";
  const ctx = await loadStorefrontPage(slug, draft);
  const data = await loadStandCartData(ctx.stand.slug, "website");
  if (!data) notFound();
  if (data.stand.cartMode === "CUSTOMER_CHOICE") {
    redirect(`${appBaseUrl()}${standCatalogPath(data.stand.slug)}/pay`);
  }

  return (
    <CommerceLayoutView
      ctx={ctx}
      draft={draft}
      activePage="cart"
      pageKey={COMMERCE_CART_KEY}
      commerceContext={{ kind: "cart", ownerId: ctx.owner.id, cart: data.props }}
      renderBlock={(metadata) => <StudioCartBlock metadata={metadata} />}
      fallback={
        <div className="storefront-page-content storefront-page-content--narrow">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--field)]">Your cart</h1>
          <StandCartCheckout {...data.props} />
        </div>
      }
    />
  );
}
