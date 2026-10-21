import type { PreOrderPageData } from "@/lib/storefront/views/preorder-page-types";
import PreOrderPageContent from "@/app/s/[standSlug]/pre/[pageSlug]/PreOrderPageContent";

/** A pre-order page's story, collection details and order card. */
export default function PreOrderPageBody({ data }: { data: PreOrderPageData }) {
  return (
    <div className="storefront-page-content storefront-page-content--narrow">
      <PreOrderPageContent
        standSlug={data.standSlug}
        standName={data.standName}
        timezone={data.timezone}
        currency={data.currency}
        accentColor={data.accentColor}
        page={{
          ...data.page,
          collectionAt: new Date(data.page.collectionAt),
          orderByAt: new Date(data.page.orderByAt),
        }}
        pageProducts={data.pageProducts}
        catalogProducts={data.catalogProducts}
      />
    </div>
  );
}
