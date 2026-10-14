import type { Metadata } from "next";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import { resolveCheckoutSuccess } from "@/app/checkout/success/resolve-checkout-success";
import { shopHomePath } from "@/lib/storefront/paths";
import { currentStorefrontBasePath } from "@/lib/tenancy/request-base-path";
import { COMMERCE_SUCCESS_KEY } from "@/lib/studio/commerce-pages";
import CommerceLayoutView from "@/lib/storefront/views/CommerceLayoutView";
import StudioOrderConfirmationBlock from "@/components/studio/blocks/StudioOrderConfirmationBlock";
import OrderConfirmationCard from "@/components/checkout/OrderConfirmationCard";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    draft?: string;
    session_id?: string;
    order_id?: string;
    paypal?: string;
    token?: string;
  }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ctx = await loadStorefrontPage(slug, (await searchParams).draft === "1");
  return { title: `Thank you | ${ctx.stand.name}`, robots: { index: false, follow: false } };
}

/** Where card and PayPal payments return to on the website. */
export default async function StorefrontCheckoutSuccessPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { draft: draftParam, ...payment } = await searchParams;
  const draft = draftParam === "1";
  const ctx = await loadStorefrontPage(slug, draft);
  const state = await resolveCheckoutSuccess(payment);
  const basePath = await currentStorefrontBasePath(ctx.storefront.slug);

  return (
    <CommerceLayoutView
      ctx={ctx}
      draft={draft}
      activePage="checkout"
      pageKey={COMMERCE_SUCCESS_KEY}
      commerceContext={{ kind: "success", ownerId: ctx.owner.id, success: state }}
      renderBlock={(metadata) => <StudioOrderConfirmationBlock metadata={metadata} />}
      fallback={
        <div className="storefront-page-content storefront-page-content--narrow py-8">
          <OrderConfirmationCard
            state={state}
            backHref={shopHomePath(ctx.storefront.slug, draft, basePath)}
            backLabel="Back to shop"
          />
        </div>
      }
    />
  );
}
