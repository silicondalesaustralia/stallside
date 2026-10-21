import type { SerializedNodes } from "@craftjs/core";
import type { StorefrontContext } from "@/lib/catalogue/storefront";
import { storefrontPublicPath } from "@/lib/catalogue/storefront";
import { buildSampleCommerceContext, withCommerceContext } from "./commerce-context";
import { COMMERCE_PAGES, commerceKeyForKind, type CommercePageKind, type StudioCommerceContext } from "./commerce-pages";
import { customPagePublicPath } from "./custom-page-paths";
import { productRelativePath } from "@/lib/catalogue/main-category";
import { ensureCustomPages, findCustomPageById, type CustomPageTemplateId } from "./custom-pages";
import { editorTargetParam, studioEditorPath, type EditorTarget } from "./editor-target";
import { studioPreviewViewPath } from "./return-to";
import { extractWebsiteStudio, studioPageNodes } from "./storage";
import type { StudioMetadata } from "./types";

type Ctx = NonNullable<StorefrontContext>;

export type EditorPageOption = { value: string; label: string; href: string };

export type EditorPage = {
  value: string;
  initialNodes: SerializedNodes | null;
  metadata: StudioMetadata;
  viewPath: string;
  pageId?: string;
  pageTitle?: string;
  pageTemplate?: CustomPageTemplateId;
  commercePageKind?: CommercePageKind;
};

function commerceViewPath(slug: string, kind: CommercePageKind, cc: StudioCommerceContext): string {
  const base = storefrontPublicPath(slug);
  if (kind === "category" && cc.category?.slug) return `${base}/${encodeURIComponent(cc.category.slug)}?draft=1`;
  if (kind === "product" && cc.product?.slug) {
    return `${base}${productRelativePath(cc.product.slug, cc.category?.slug)}?draft=1`;
  }
  if (kind === "menu") {
    if (!cc.menu?.slug) return `${base}/menus?draft=1`;
    return `${base}/${cc.menu.isPreOrderDrop ? "pre-orders" : "menus"}/${encodeURIComponent(cc.menu.slug)}?draft=1`;
  }
  if (kind === "preorder") {
    return cc.preOrder ? `${base}/pre-orders/${encodeURIComponent(cc.preOrder.page.slug)}?draft=1` : `${base}?draft=1`;
  }
  if (kind === "subscription") {
    const offer = cc.subscription?.offer.slug;
    return `${base}/subscriptions${offer ? `/${encodeURIComponent(offer)}` : ""}?draft=1`;
  }
  if (kind === "cart") return `${base}/cart?draft=1`;
  if (kind === "success") return `${base}/checkout/success?draft=1`;
  return `${base}/shop?draft=1`;
}

function showsMenus(ctx: Ctx): boolean {
  return ctx.businessMode === "FOOD_BUSINESS" || ctx.businessMode === "BOTH";
}

/** Every page the storefront editor can open, in menu order. */
export function editorPageOptions(ctx: Ctx): EditorPageOption[] {
  const slug = ctx.storefront.slug;
  const option = (target: EditorTarget, label: string): EditorPageOption => ({
    value: editorTargetParam(target),
    label,
    href: studioEditorPath(slug, target),
  });
  const pages = ensureCustomPages(ctx.storefront.draftConfig)
    .filter((p) => p.enabled)
    .map((p) => option({ kind: "page", pageId: p.id }, p.title));
  const commerce = COMMERCE_PAGES.filter((p) => p.kind !== "menu" || showsMenus(ctx)).map((p) =>
    option({ kind: "commerce", commerceKind: p.kind }, `${p.label} layout`),
  );
  return [option({ kind: "home" }, "Home"), ...pages, ...commerce];
}

/** True when the target is a page that exists but is unpublished (not editable on the site). */
export function isUnpublishedPageTarget(ctx: Ctx, target: EditorTarget): boolean {
  if (target.kind !== "page") return false;
  const page = findCustomPageById(ensureCustomPages(ctx.storefront.draftConfig), target.pageId);
  return Boolean(page && !page.enabled);
}

/** Loads the nodes, metadata and "Done" link for one editor page; null if it no longer exists. */
export async function loadEditorPage(ctx: Ctx, target: EditorTarget, baseMetadata: StudioMetadata): Promise<EditorPage | null> {
  const slug = ctx.storefront.slug;
  const studio = extractWebsiteStudio(ctx.storefront.draftConfig) ?? null;
  const value = editorTargetParam(target);

  if (target.kind === "page") {
    const page = findCustomPageById(ensureCustomPages(ctx.storefront.draftConfig), target.pageId);
    if (!page) return null;
    return {
      value,
      initialNodes: studio ? studioPageNodes(studio, page.id) ?? null : null,
      metadata: baseMetadata,
      viewPath: customPagePublicPath(slug, page, true),
      pageId: page.id,
      pageTitle: page.title,
      pageTemplate: page.template,
    };
  }

  if (target.kind === "commerce") {
    const cc = await buildSampleCommerceContext(ctx, target.commerceKind);
    return {
      value,
      initialNodes: studio ? studioPageNodes(studio, commerceKeyForKind(target.commerceKind)) ?? null : null,
      metadata: withCommerceContext(baseMetadata, cc),
      viewPath: commerceViewPath(slug, target.commerceKind, cc),
      commercePageKind: target.commerceKind,
    };
  }

  return {
    value,
    initialNodes: studio?.nodes ?? null,
    metadata: baseMetadata,
    viewPath: studioPreviewViewPath(slug),
  };
}
