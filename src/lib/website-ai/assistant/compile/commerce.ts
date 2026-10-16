import type { SerializedNodes } from "@craftjs/core";
import type { SectionInstance } from "@/lib/website/schema/definition";
import type { PageKind } from "@/lib/website/sections/fields";
import { sectionDefinition } from "@/lib/website/sections/registry";
import type { VendlSectionType } from "@/lib/website/sections/types";
import { sectionsToCraftNodes } from "@/lib/website/adapter/to-craft";
import { craftPageSaveErrors } from "@/lib/website/adapter/validate-craft-page";
import { WEBSITE_LIMITS as L } from "@/lib/website/schema/limits";
import {
  COMMERCE_CATEGORY_KEY,
  COMMERCE_PRODUCT_KEY,
  COMMERCE_SHOP_KEY,
  type CommercePageKey,
} from "@/lib/studio/commerce-pages";
import type { AssistantContext } from "../context/types";
import type { DesignChoice } from "./design";
import { productInfoRows, productLayoutFor } from "./product-info";

export const ASSISTANT_SOURCE = "website-ai-assistant";

type Built = { key: CommercePageKey; kind: PageKind; sections: SectionInstance[] };

function section(
  id: string,
  type: VendlSectionType,
  preferred: string | undefined,
  content: Record<string, unknown>,
  settings: Record<string, unknown>,
  binding?: Record<string, unknown>,
): SectionInstance {
  const def = sectionDefinition(type);
  return {
    id,
    type,
    schemaVersion: 1,
    variant: preferred && def.variants.includes(preferred) ? preferred : def.defaultVariant,
    visibility: "public",
    content,
    settings,
    ...(binding ? { binding } : {}),
    editorMeta: { source: ASSISTANT_SOURCE, aiType: type },
  };
}

function productPage(ctx: AssistantContext): Built {
  const hasReviews = ctx.reviews.count > 0;
  const layout = productLayoutFor(ctx);
  return {
    key: COMMERCE_PRODUCT_KEY,
    kind: "product",
    sections: [
      section("ai_product_detail", "productDetail", undefined, { infoRows: productInfoRows(ctx) }, {
        layout,
        imageRatio: "square",
        ...(layout === "featured" ? { imageSize: 55 } : {}),
        showBackLink: true,
        showBreadcrumbs: true,
        showRating: hasReviews,
        showReviews: true,
        showReviewForm: true,
        stickyCart: true,
        showPayments: ctx.features.paymentBrands.length > 0,
      }),
    ],
  };
}

function shopPage(ctx: AssistantContext, design: DesignChoice): Built {
  const many = ctx.catalogue.productCount > 12;
  const sections: SectionInstance[] = [];
  if (ctx.catalogue.categories.length >= 2) {
    sections.push(section("ai_shop_categories", "categories", design.presets.categories, { heading: "Browse" }, {}, { source: "all" }));
  }
  sections.push(
    section(
      "ai_shop_products",
      "productGrid",
      design.presets.productGrid,
      { heading: design.templateId === "farmhouse" ? "What's available" : "Shop" },
      { limit: Math.min(L.productIdsPerSection, Math.max(ctx.catalogue.productCount, 1)), columns: many ? 4 : 3, showPrice: true, showAvailability: true },
      { source: "all" },
    ),
  );
  return { key: COMMERCE_SHOP_KEY, kind: "shop", sections };
}

function categoryPage(design: DesignChoice): Built {
  return {
    key: COMMERCE_CATEGORY_KEY,
    kind: "category",
    sections: [
      section("ai_category_detail", "categoryDetail", design.presets.productGrid, {}, {
        showTitle: true,
        showTopDescription: true,
        showBottomDescription: true,
        columns: 3,
        showPrice: true,
        showAvailability: true,
      }),
    ],
  };
}

export type CommerceCompile = { pages: Partial<Record<CommercePageKey, SerializedNodes>>; errors: string[] };

/** Product, shop and category page layouts from real catalogue facts. Pages that fail validation are skipped. */
export function compileCommercePages(ctx: AssistantContext, design: DesignChoice, shop: boolean): CommerceCompile {
  if (ctx.catalogue.productCount === 0) return { pages: {}, errors: [] };
  const built: Built[] = [productPage(ctx)];
  if (shop) built.push(shopPage(ctx, design));
  if (ctx.catalogue.categories.length > 0) built.push(categoryPage(design));
  const out: CommerceCompile = { pages: {}, errors: [] };
  for (const page of built) {
    const nodes = sectionsToCraftNodes(page.sections);
    const errors = craftPageSaveErrors(nodes, page.kind, ctx.businessMode);
    if (errors.length > 0) out.errors.push(...errors.map((e) => `${page.key}: ${e}`));
    else out.pages[page.key] = nodes;
  }
  return out;
}

/** Commerce layouts the builder may replace: empty, or made entirely by a previous assistant build. */
export function replaceableCommercePage(nodes: SerializedNodes | undefined): boolean {
  if (!nodes) return true;
  const sections = Object.entries(nodes).filter(([id]) => id !== "ROOT");
  return sections.every(([, node]) => (node.custom as { source?: unknown } | undefined)?.source === ASSISTANT_SOURCE);
}
