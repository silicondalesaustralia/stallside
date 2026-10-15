"use client";

import { useNode } from "@craftjs/core";
import CraftSectionChrome from "@/components/craft/CraftSectionChrome";
import { useCraftMetadata } from "@/components/craft/CraftEditorContext";
import StudioProductDetailBlock from "@/components/studio/blocks/StudioProductDetailBlock";
import type { StudioMetadata } from "@/lib/studio/types";
import {
  productDetailView,
  type InfoRow,
  type ProductImageRatio,
  type ProductLayout,
  type ProductTab,
} from "@/lib/studio/product-detail-settings";
import type { ProductBlockLayout } from "@/lib/studio/product-blocks";
import type { ProductButtons } from "@/lib/studio/product-buttons";
import ProductReviewsPreview from "@/components/storefront/reviews/ProductReviewsPreview";

export type CraftProductDetailProps = {
  showReviews: boolean;
  /** With reviews on: the "Leave a review" form under them; on unless switched off. */
  showReviewForm?: boolean;
  showBackLink: boolean;
  /** Missing on older pages, which show breadcrumbs. */
  showBreadcrumbs?: boolean;
  /** Missing on pages saved before layouts existed; those render as "simple". */
  layout?: ProductLayout;
  imageRatio?: ProductImageRatio;
  imageSide?: "left" | "right";
  imageSize?: number;
  blockLayout?: ProductBlockLayout;
  enlarge?: boolean;
  stickyCart?: boolean;
  buttons?: ProductButtons;
  buttonWidth?: number;
  showPayments?: boolean;
  infoRows?: InfoRow[];
  tabs?: ProductTab[];
};

function isStudioMetadata(meta: unknown): meta is StudioMetadata {
  return Boolean(meta && typeof meta === "object" && "templateId" in meta);
}

export default function CraftProductDetailSection(props: CraftProductDetailProps) {
  const {
    connectors: { connect, drag },
    actions: { setProp },
  } = useNode();
  const metadata = useCraftMetadata();

  return (
    <div
      ref={(dom) => {
        if (dom) connect(drag(dom));
      }}
    >
      <CraftSectionChrome>
        {isStudioMetadata(metadata) ? (
          <StudioProductDetailBlock
            showBreadcrumbs={props.showBreadcrumbs !== false}
            showBackLink={props.showBackLink !== false}
            view={productDetailView(props)}
            metadata={metadata}
            isEditing
            onBlockLayoutChange={(next) =>
              setProp((p: CraftProductDetailProps) => {
                p.blockLayout = next;
              })
            }
          />
        ) : (
          <p className="p-6 text-sm text-[var(--muted)]">Product detail</p>
        )}
        {props.showReviews && isStudioMetadata(metadata) ? (
          <ProductReviewsPreview reviews={metadata.reviews} storefrontSlug={metadata.storefrontSlug} showForm={props.showReviewForm !== false} />
        ) : null}
      </CraftSectionChrome>
    </div>
  );
}

CraftProductDetailSection.craft = {
  displayName: "CraftProductDetailSection",
  props: {
    showReviews: true,
    showBackLink: true,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
    canDelete: () => false,
  },
};
