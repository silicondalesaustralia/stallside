import type { StudioMetadata } from "@/lib/studio/types";
import type { OfferPageView } from "@/lib/studio/offer-page-settings";
import PreOrderPageBody from "./PreOrderPageBody";

/** The pre-order page itself: story, collection details and the order card. */
export default function StudioPreOrderBlock({
  metadata,
  view,
  isEditing,
}: {
  metadata: StudioMetadata;
  view?: OfferPageView;
  isEditing?: boolean;
}) {
  const data = metadata.commerceContext?.preOrder;
  if (data) return <PreOrderPageBody data={data} view={view} />;
  if (!isEditing) return null;
  return (
    <div className="storefront-page-content storefront-page-content--narrow">
      <p className="rounded-xl border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">
        Your pre-order page shows here. Create a pre-order page with at least one product to preview it.
      </p>
    </div>
  );
}
