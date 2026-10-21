import type { StudioMetadata } from "@/lib/studio/types";
import { offerPanelStyle, type OfferPageView } from "@/lib/studio/offer-page-settings";
import SubscriptionListBody from "@/app/s/[standSlug]/sub/SubscriptionListBody";

/** Every live subscription and membership as cards (the subscriptions category). */
export default function StudioSubscriptionListBlock({ metadata, view }: { metadata: StudioMetadata; view?: OfferPageView }) {
  const data = metadata.commerceContext?.subscriptionList;
  if (!data) return null;
  const style = offerPanelStyle(view);
  if (!style) return <SubscriptionListBody data={data} />;
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-4">
      <div style={style}>
        <SubscriptionListBody data={data} />
      </div>
    </div>
  );
}
