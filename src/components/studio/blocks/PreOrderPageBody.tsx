import type { PreOrderPageData } from "@/lib/storefront/views/preorder-page-types";
import { isShown, offerPanelStyle, type OfferPageView } from "@/lib/studio/offer-page-settings";
import PreOrderPageContent from "@/app/s/[standSlug]/pre/[pageSlug]/PreOrderPageContent";

/** A pre-order page's story, collection details and order card. */
export default function PreOrderPageBody({ data, view }: { data: PreOrderPageData; view?: OfferPageView }) {
  return (
    <div className="storefront-page-content storefront-page-content--narrow">
      <div style={offerPanelStyle(view)}>
        {data.page.imageUrl && isShown(view, "showImage") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.page.imageUrl} alt="" className="sf-photo sf-photo-frame mb-6 w-full rounded-xl [--photo-default-bg:var(--wash)] [--photo-default-ratio:16/9]" />
        ) : null}
        <PreOrderPageContent
          standSlug={data.standSlug}
          standName={data.standName}
          timezone={data.timezone}
          currency={data.currency}
          accentColor={data.accentColor}
          cardReady={data.cardReady}
          page={{
            ...data.page,
            collectionAt: new Date(data.page.collectionAt),
            orderByAt: new Date(data.page.orderByAt),
          }}
          pageProducts={data.pageProducts}
          catalogProducts={data.catalogProducts}
          view={view}
        />
      </div>
    </div>
  );
}
