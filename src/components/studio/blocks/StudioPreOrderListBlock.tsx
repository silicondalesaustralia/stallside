import type { StudioMetadata } from "@/lib/studio/types";
import { offerPanelStyle, type OfferPageView } from "@/lib/studio/offer-page-settings";
import PreOrderListBody from "@/app/s/[standSlug]/pre/PreOrderListBody";

/** Every open pre-order page as cards (the pre-orders category). */
export default function StudioPreOrderListBlock({ metadata, view }: { metadata: StudioMetadata; view?: OfferPageView }) {
  const data = metadata.commerceContext?.preOrderList;
  if (!data) return null;
  const style = offerPanelStyle(view);
  if (!style) return <PreOrderListBody data={data} />;
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-4">
      <div style={style}>
        <PreOrderListBody data={data} />
      </div>
    </div>
  );
}
