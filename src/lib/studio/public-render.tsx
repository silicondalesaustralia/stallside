import type { SerializedNodes } from "@craftjs/core";
import type { StudioMetadata, StudioSectionType } from "./types";
import { studioSectionRule } from "./section-registry";
import { findStudioCanvasParentId, pageBackgroundOf } from "./page-canvas";
import SectionStyleFrame from "@/components/studio/SectionStyleFrame";
import { parseSectionStyle } from "@/lib/website/sections/section-style";
import { colourCss, paletteOf } from "@/lib/website/sections/colour";
import { isPublicStudioNode } from "./node-visibility";
import StudioHeroBlock from "@/components/studio/blocks/StudioHeroBlock";
import StudioHeroFrame from "@/components/studio/StudioHeroFrame";
import StudioProductsBlock from "@/components/studio/blocks/StudioProductsBlock";
import StudioNextDropBlock from "@/components/studio/blocks/StudioNextDropBlock";
import StudioCategoriesBlock from "@/components/studio/blocks/StudioCategoriesBlock";
import StudioTextBlock from "@/components/studio/blocks/StudioTextBlock";
import StudioFaqBlock from "@/components/studio/blocks/StudioFaqBlock";
import { parseFaqItems } from "@/lib/studio/faq-items";
import StudioContactFormBlock from "@/components/studio/blocks/StudioContactFormBlock";
import { parseContactLayout } from "@/lib/studio/contact-form";
import StudioImageBlock from "@/components/studio/blocks/StudioImageBlock";
import StudioImageTextBlock from "@/components/studio/blocks/StudioImageTextBlock";
import StudioPaymentsBlock from "@/components/studio/blocks/StudioPaymentsBlock";
import StudioPreOrderBlock from "@/components/studio/blocks/StudioPreOrderBlock";
import StudioSubscriptionBlock from "@/components/studio/blocks/StudioSubscriptionBlock";
import StudioPreOrderListBlock from "@/components/studio/blocks/StudioPreOrderListBlock";
import StudioSubscriptionListBlock from "@/components/studio/blocks/StudioSubscriptionListBlock";
import { parseGalleryImages, parseImageAspect, parseImageDisplay } from "@/lib/studio/gallery-images";
import { parseImageStyle } from "@/lib/studio/image-pair";
import StudioReviewsBlock from "@/components/studio/blocks/StudioReviewsBlock";
import StudioPickupBlock from "@/components/studio/blocks/StudioPickupBlock";
import StudioSignupBlock from "@/components/studio/blocks/StudioSignupBlock";
import StudioFarmStandBlock from "@/components/studio/blocks/StudioFarmStandBlock";
import StudioProductDetailBlock from "@/components/studio/blocks/StudioProductDetailBlock";
import { productDetailView } from "@/lib/studio/product-detail-settings";
import StudioCategoryDetailBlock from "@/components/studio/blocks/StudioCategoryDetailBlock";
import { categoryDetailView } from "@/lib/studio/category-detail-settings";
import { parseCategoryCardBackground } from "@/lib/studio/category-looks";
import StudioSpacerBlock from "@/components/studio/blocks/StudioSpacerBlock";
import { spacerView } from "@/lib/studio/spacer-settings";
import StudioMenuDetailBlock from "@/components/studio/blocks/StudioMenuDetailBlock";
import StudioCartBlock from "@/components/studio/blocks/StudioCartBlock";
import StudioOrderConfirmationBlock from "@/components/studio/blocks/StudioOrderConfirmationBlock";
import { ProductApprovedReviews } from "@/components/storefront/ProductApprovedReviews";
import PuckAboutBlock from "@/components/puck/blocks/PuckAboutBlock";
import type { HeroPreset, ProductPreset, NextDropPreset } from "./preset-registry";

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
      if (!isPublicStudioNode(node)) return null;
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
  const palette = paletteOf(metadata.resolvedBranding);
  const pageBackground = pageBackgroundOf(nodes);

  return (
    <div
      className="studio-page-root"
      style={pageBackground ? { backgroundColor: colourCss(pageBackground) } : undefined}
    >
      {sections.map((section, index) => (
        <SectionStyleFrame
          key={`${section.type}-${index}`}
          sectionStyle={parseSectionStyle(section.props.style)}
          palette={palette}
          buttonLink={section.props.buttonLink}
          texts={section.props.texts}
        >
          <StudioSectionRender section={section} metadata={metadata} />
        </SectionStyleFrame>
      ))}
    </div>
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
        <StudioHeroFrame width={typeof p.width === "string" ? p.width : undefined}>
        <StudioHeroBlock
          headline={String(p.headline ?? "")}
          supportingText={String(p.supportingText ?? "")}
          layout={(p.layout as HeroPreset) ?? "background"}
          ctaLabel={String(p.ctaLabel ?? "Shop now")}
          showCta={Boolean(p.showCta ?? true)}
          backgroundImageUrl={
            p.decorativeImageUrl
              ? String(p.decorativeImageUrl)
              : p.imageUrl
                ? String(p.imageUrl)
                : null
          }
          look={p}
          metadata={metadata}
        />
        </StudioHeroFrame>
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
          align={p.align === "centre" ? "centre" : "left"}
          heading={String(p.heading ?? "Products")}
          showPrice={Boolean(p.showPrice ?? true)}
          showAvailability={Boolean(p.showAvailability ?? true)}
          showRatings={p.showRatings === true}
          showCategoryIntro={p.showCategoryIntro !== false}
          cardBackground={parseCategoryCardBackground(p.cardBackground)}
          metadata={metadata}
        />
      );
    case "CraftProductDetailSection":
      return (
        <>
          <StudioProductDetailBlock
            showBreadcrumbs={p.showBreadcrumbs !== false}
            showBackLink={p.showBackLink !== false}
            view={productDetailView(p)}
            metadata={metadata}
          />
          {Boolean(p.showReviews) &&
          metadata.commerceContext?.ownerId &&
          metadata.commerceContext.product ? (
            <div className="storefront-page-content storefront-page-content--narrow storefront-page-content--after-product">
              <ProductApprovedReviews
                ownerId={metadata.commerceContext.ownerId}
                productId={metadata.commerceContext.product.id}
                storefrontSlug={metadata.storefrontSlug}
                showForm={p.showReviewForm !== false}
                className=""
              />
            </div>
          ) : null}
        </>
      );
    case "CraftCategoryDetailSection":
      return <StudioCategoryDetailBlock view={categoryDetailView(p)} metadata={metadata} />;
    case "CraftSpacerSection":
      return <StudioSpacerBlock {...spacerView(p)} />;
    case "CraftMenuDetailSection":
      return <StudioMenuDetailBlock metadata={metadata} />;
    case "CraftCartSection":
      return <StudioCartBlock metadata={metadata} />;
    case "CraftPreOrderSection":
      return <StudioPreOrderBlock metadata={metadata} />;
    case "CraftPreOrderListSection":
      return <StudioPreOrderListBlock metadata={metadata} />;
    case "CraftSubscriptionListSection":
      return <StudioSubscriptionListBlock metadata={metadata} />;
    case "CraftSubscriptionSection":
      return <StudioSubscriptionBlock metadata={metadata} />;
    case "CraftOrderConfirmationSection":
      return <StudioOrderConfirmationBlock metadata={metadata} showRestock={p.showRestock !== false} />;
    case "CraftCategoriesSection":
      return (
        <StudioCategoriesBlock
          source={(p.source as "all") ?? "all"}
          categoryIds={(p.categoryIds as string[]) ?? []}
          preset={String(p.preset ?? p.layout ?? "tiles")}
          heading={String(p.heading ?? "Categories")}
          intro={typeof p.intro === "string" ? p.intro : ""}
          showDescriptions={p.showDescriptions === true}
          showRatings={p.showRatings === true}
          cardBackground={parseCategoryCardBackground(p.cardBackground)}
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
    case "CraftFaqSection":
      return (
        <StudioFaqBlock
          heading={String(p.heading ?? "")}
          intro={String(p.intro ?? "")}
          items={parseFaqItems(p.items)}
          startOpen={p.startOpen === true}
        />
      );
    case "CraftContactFormSection":
      return (
        <StudioContactFormBlock
          heading={String(p.heading ?? "")}
          body={String(p.body ?? "")}
          buttonLabel={String(p.buttonLabel ?? "")}
          layout={parseContactLayout(p.layout)}
          showPhone={p.showPhone !== false}
          standId={metadata.standId}
        />
      );
    case "CraftImageSection":
      return (
        <StudioImageBlock
          imageUrl={p.imageUrl ? String(p.imageUrl) : null}
          imageStyle={parseImageStyle(p.imageStyle)}
          secondImageUrl={p.secondImageUrl ? String(p.secondImageUrl) : null}
          alt={String(p.alt ?? "")}
          layout={(p.layout as "contained") ?? "contained"}
          caption={String(p.caption ?? "")}
          display={parseImageDisplay(p.display)}
          images={parseGalleryImages(p.images)}
          columns={p.columns === 2 || p.columns === 4 ? p.columns : 3}
          aspect={parseImageAspect(p.aspect)}
          autoplay={p.autoplay === true}
        />
      );
    case "CraftImageTextSection":
      return (
        <StudioImageTextBlock
          imageUrl={p.imageUrl ? String(p.imageUrl) : null}
          imageStyle={parseImageStyle(p.imageStyle)}
          secondImageUrl={p.secondImageUrl ? String(p.secondImageUrl) : null}
          heading={String(p.heading ?? "")}
          body={String(p.body ?? "")}
          layout={(p.layout as "image-left") ?? "image-left"}
          ctaLabel={String(p.ctaLabel ?? "")}
          metadata={metadata}
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
          showForm={p.showForm !== false}
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
    case "CraftPaymentsSection":
      return (
        <StudioPaymentsBlock
          heading={String(p.heading ?? "")}
          layout={p.layout === "bar" ? "bar" : "slider"}
          showLabels={Boolean(p.showLabels)}
          brands={metadata.paymentBrands}
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
    default: {
      const unhandled: never = section.type;
      return unhandled;
    }
  }
}
