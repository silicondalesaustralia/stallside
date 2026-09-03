import type { SerializedNodes } from "@craftjs/core";
import { ROOT_NODE } from "@craftjs/utils";
import type { StudioMetadata, StudioSectionType } from "./types";
import { studioSectionRule } from "./section-registry";
import { findStudioCanvasParentId } from "./page-canvas";
import StudioHeroBlock from "@/components/studio/blocks/StudioHeroBlock";
import StudioProductsBlock from "@/components/studio/blocks/StudioProductsBlock";
import StudioNextDropBlock from "@/components/studio/blocks/StudioNextDropBlock";
import StudioCategoriesBlock from "@/components/studio/blocks/StudioCategoriesBlock";
import StudioTextBlock from "@/components/studio/blocks/StudioTextBlock";
import StudioImageBlock from "@/components/studio/blocks/StudioImageBlock";
import StudioImageTextBlock from "@/components/studio/blocks/StudioImageTextBlock";
import StudioReviewsBlock from "@/components/studio/blocks/StudioReviewsBlock";
import StudioPickupBlock from "@/components/studio/blocks/StudioPickupBlock";
import StudioSignupBlock from "@/components/studio/blocks/StudioSignupBlock";
import StudioFarmStandBlock from "@/components/studio/blocks/StudioFarmStandBlock";
import StudioProductDetailBlock from "@/components/studio/blocks/StudioProductDetailBlock";
import StudioMenuDetailBlock from "@/components/studio/blocks/StudioMenuDetailBlock";
import { ProductApprovedReviews } from "@/components/storefront/ProductApprovedReviews";
import PuckAboutBlock from "@/components/puck/blocks/PuckAboutBlock";
import type { HeroPreset, ProductPreset, NextDropPreset, CategoryPreset } from "./preset-registry";
import { mapCategoryPreset } from "./preset-registry";

type SectionNode = {
  type: StudioSectionType;
  props: Record<string, unknown>;
};

function resolvedName(node: SerializedNodes[string] | undefined): string | undefined {
  if (!node) return undefined;
  return typeof node.type === "string" ? node.type : node.type?.resolvedName;
}

function pageSectionNodes(nodes: SerializedNodes): SectionNode[] {
  const canvasId = findStudioCanvasParentId(nodes);
  const canvas = nodes[canvasId];
  if (!canvas?.nodes?.length) return [];
  return canvas.nodes
    .map((id) => {
      const node = nodes[id];
      const name = resolvedName(node);
      if (!name || !studioSectionRule(name)) return null;
      return { type: name as StudioSectionType, props: node?.props ?? {} };
    })
    .filter((n): n is SectionNode => Boolean(n));
}

/** Server-safe public renderer — no Craft.js editor runtime */
export default function StudioPublicSections({
  nodes,
  metadata,
}: {
  nodes: SerializedNodes;
  metadata: StudioMetadata;
}) {
  const sections = pageSectionNodes(nodes);

  return (
    <>
      {sections.map((section, index) => (
        <StudioSectionRender
          key={`${section.type}-${index}`}
          section={section}
          metadata={metadata}
        />
      ))}
    </>
  );
}

function StudioSectionRender({
  section,
  metadata,
}: {
  section: SectionNode;
  metadata: StudioMetadata;
}) {
  const p = section.props;
  switch (section.type) {
    case "CraftHeroSection":
      return (
        <StudioHeroBlock
          headline={String(p.headline ?? "")}
          supportingText={String(p.supportingText ?? "")}
          layout={(p.layout as HeroPreset) ?? "background"}
          ctaLabel={String(p.ctaLabel ?? "Shop now")}
          showCta={Boolean(p.showCta ?? true)}
          metadata={metadata}
        />
      );
    case "CraftProductGridSection":
      return (
        <StudioProductsBlock
          source={(p.source as "all") ?? "all"}
          categoryId={String(p.categoryId ?? "")}
          productIds={(p.productIds as string[]) ?? []}
          limit={Number(p.limit ?? 8)}
          preset={(p.preset as ProductPreset) ?? "classic"}
          columns={(p.columns as 3) ?? 3}
          heading={String(p.heading ?? "Products")}
          showPrice={Boolean(p.showPrice ?? true)}
          showAvailability={Boolean(p.showAvailability ?? true)}
          metadata={metadata}
        />
      );
    case "CraftProductDetailSection":
      return (
        <>
          <StudioProductDetailBlock
            showBackLink={Boolean(p.showBackLink ?? true)}
            metadata={metadata}
          />
          {Boolean(p.showReviews) &&
          metadata.commerceContext?.ownerId &&
          metadata.commerceContext.product ? (
            <div className="storefront-page-content storefront-page-content--narrow">
              <ProductApprovedReviews
                ownerId={metadata.commerceContext.ownerId}
                productId={metadata.commerceContext.product.id}
              />
            </div>
          ) : null}
        </>
      );
    case "CraftMenuDetailSection":
      return <StudioMenuDetailBlock metadata={metadata} />;
    case "CraftCategoriesSection":
      return (
        <StudioCategoriesBlock
          source={(p.source as "all") ?? "all"}
          categoryIds={(p.categoryIds as string[]) ?? []}
          preset={mapCategoryPreset(
            metadata.templateId,
            (p.preset as CategoryPreset) ?? (p.layout as CategoryPreset) ?? "tiles",
          )}
          heading={String(p.heading ?? "Categories")}
          metadata={metadata}
        />
      );
    case "CraftNextDropSection":
      return (
        <StudioNextDropBlock
          maxItems={Number(p.maxItems ?? 3)}
          preset={(p.preset as NextDropPreset) ?? "card"}
          heading={String(p.heading ?? "Next bake")}
          showClosingDate={Boolean(p.showClosingDate ?? true)}
          showPickupDate={Boolean(p.showPickupDate ?? true)}
          metadata={metadata}
        />
      );
    case "CraftTextSection":
      return (
        <StudioTextBlock
          heading={String(p.heading ?? "")}
          body={String(p.body ?? "")}
          alignment={(p.alignment as "left") ?? "left"}
        />
      );
    case "CraftImageSection":
      return (
        <StudioImageBlock
          imageUrl={p.imageUrl ? String(p.imageUrl) : null}
          alt={String(p.alt ?? "")}
          layout={(p.layout as "contained") ?? "contained"}
          caption={String(p.caption ?? "")}
        />
      );
    case "CraftImageTextSection":
      return (
        <StudioImageTextBlock
          imageUrl={p.imageUrl ? String(p.imageUrl) : null}
          heading={String(p.heading ?? "")}
          body={String(p.body ?? "")}
          layout={(p.layout as "image-left") ?? "image-left"}
          ctaLabel={String(p.ctaLabel ?? "")}
        />
      );
    case "CraftAboutSection":
      return (
        <PuckAboutBlock
          heading={String(p.heading ?? "About us")}
          body={String(p.body ?? "")}
          layout={(p.layout as "simple") ?? "simple"}
        />
      );
    case "CraftReviewsSection":
      return (
        <StudioReviewsBlock
          preset={(p.preset as "cards") ?? "cards"}
          heading={String(p.heading ?? "What customers say")}
          maxItems={Number(p.maxItems ?? 4)}
          metadata={metadata}
        />
      );
    case "CraftPickupSection":
      return (
        <StudioPickupBlock
          preset={(p.preset as "cards") ?? "cards"}
          heading={String(p.heading ?? "Pickup & delivery")}
          metadata={metadata}
        />
      );
    case "CraftSignupSection":
      return (
        <StudioSignupBlock
          heading={String(p.heading ?? "Stay in the loop")}
          body={String(p.body ?? "")}
          buttonLabel={String(p.buttonLabel ?? "Subscribe")}
          standId={metadata.standId}
        />
      );
    case "CraftFarmStandSection":
      return (
        <StudioFarmStandBlock
          heading={String(p.heading ?? "Visit the stand")}
          showHours={Boolean(p.showHours ?? true)}
          showLocation={Boolean(p.showLocation ?? true)}
          showDirections={Boolean(p.showDirections ?? true)}
          metadata={metadata}
        />
      );
    default:
      return null;
  }
}
