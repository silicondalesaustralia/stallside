import type { StudioMetadata } from "@/lib/studio/types";
import { offerPanelStyle, type OfferPageView } from "@/lib/studio/offer-page-settings";
import SubscriptionOfferContent from "@/app/s/[standSlug]/sub/[offerSlug]/SubscriptionOfferContent";

/** The subscription or membership offer itself: story, prices and sign-up. */
export default function StudioSubscriptionBlock({
  metadata,
  view,
  isEditing,
}: {
  metadata: StudioMetadata;
  view?: OfferPageView;
  isEditing?: boolean;
}) {
  const cc = metadata.commerceContext;
  const data = cc?.subscription;
  if (!data) {
    if (!isEditing) return null;
    return (
      <div className="storefront-page-content storefront-page-content--narrow">
        <p className="rounded-xl border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">
          Your subscription and membership pages show here. Create a subscription or membership to preview it.
        </p>
      </div>
    );
  }
  return (
    <div className="storefront-page-content storefront-page-content--narrow">
      <div style={offerPanelStyle(view)}>
        <SubscriptionOfferContent data={data} cancelled={cc?.cancelled === true} view={view} />
      </div>
    </div>
  );
}
