import type { StudioMetadata } from "@/lib/studio/types";
import type { SuccessPageState } from "@/app/checkout/success/success-state";
import { PAID_MESSAGE } from "@/app/checkout/success/success-messages";
import { shopHomePath } from "@/lib/storefront/paths";
import OrderConfirmationCard from "@/components/checkout/OrderConfirmationCard";

function sampleState(meta: StudioMetadata): SuccessPageState {
  const items = (meta.commerceContext?.catalogProducts ?? []).slice(0, 2);
  return {
    message: PAID_MESSAGE,
    demoStandSlug: null,
    demoProduct: null,
    restock: null,
    preOrder: {
      collectionLabel: "Saturday, 9:00 am",
      collectionNote: null,
      customerName: "Sam Shopper",
      items: (items.length ? items.map((p) => p.name) : ["Sample product"]).map((name) => ({ name, quantity: 1 })),
    },
  };
}

/** Thank-you page after card / PayPal checkout returns to the website. */
export default function StudioOrderConfirmationBlock({
  metadata: meta,
  isEditing,
}: {
  metadata: StudioMetadata;
  isEditing?: boolean;
}) {
  const live = meta.commerceContext?.success;
  if (!live && !isEditing) return null;
  return (
    <div className="storefront-page-content storefront-page-content--narrow py-8">
      <OrderConfirmationCard
        state={live ?? sampleState(meta)}
        backHref={shopHomePath(meta.storefrontSlug, meta.draft, meta.basePath)}
        backLabel="Back to shop"
      />
    </div>
  );
}
