import { notFound } from "next/navigation";
import type { StorefrontContext } from "@/lib/catalogue/storefront";
import { appBaseUrl } from "@/lib/app-url";
import { buildStudioMetadata } from "@/lib/studio/build-metadata";
import { parseEditorTarget, studioEditorPath } from "@/lib/studio/editor-target";
import { editorPageOptions, loadEditorPage } from "@/lib/studio/load-editor-page";
import { defaultTemplateId, extractWebsiteStudio } from "@/lib/studio/storage";
import StudioPreviewEditor from "./StudioPreviewEditor";

/** The one place sellers edit page layouts and content: every page, on the storefront. */
export default async function StudioStorefrontEditor({
  ctx,
  page,
  flash,
}: {
  ctx: NonNullable<StorefrontContext>;
  page?: string;
  flash: { saved?: boolean; published?: boolean; error?: string };
}) {
  const target = parseEditorTarget(page);
  const studio = extractWebsiteStudio(ctx.storefront.draftConfig) ?? null;
  const templateId = defaultTemplateId(studio, ctx.businessMode);
  const baseMetadata = await buildStudioMetadata(ctx, templateId, true);
  const editorPage = await loadEditorPage(ctx, target, baseMetadata);
  if (!editorPage) notFound();

  const origin = appBaseUrl();
  const editPath = studioEditorPath(ctx.storefront.slug, target);
  const isHome = target.kind === "home";

  return (
    <StudioPreviewEditor
      key={editorPage.value}
      initialNodes={editorPage.initialNodes}
      metadata={editorPage.metadata}
      templateId={templateId}
      previewUrl={`${origin}${editPath}`}
      viewPreviewUrl={`${origin}${editorPage.viewPath}`}
      isPublished={ctx.storefront.isPublished}
      starter={{
        headline: ctx.branding.headline,
        subheadline: ctx.branding.subheadline,
        about: ctx.branding.about,
        showNextDrop: isHome && (ctx.businessMode === "FOOD_BUSINESS" || ctx.businessMode === "BOTH"),
      }}
      returnTo={editPath}
      pageId={editorPage.pageId}
      pageTitle={editorPage.pageTitle}
      pageTemplate={editorPage.pageTemplate}
      commercePageKind={editorPage.commercePageKind}
      pageOptions={editorPageOptions(ctx)}
      currentPage={editorPage.value}
      saved={flash.saved}
      published={flash.published}
      error={flash.error}
    />
  );
}
