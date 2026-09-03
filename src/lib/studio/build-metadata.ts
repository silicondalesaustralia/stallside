import type { StorefrontContext } from "@/lib/catalogue/storefront";
import { buildPuckSpikeMetadata } from "@/lib/puck/build-metadata";
import { loadStorefrontReviews } from "./load-reviews";
import { ensureCustomPages } from "./custom-pages";
import { footerPagesFromCustomPages } from "./custom-page-paths";
import { ensureBlogSettings } from "./blog";
import { buildStudioHeaderNav } from "./navigation";
import type { StudioMetadata, StudioTemplateId } from "./types";

export async function buildStudioMetadata(
  ctx: NonNullable<StorefrontContext>,
  templateId: StudioTemplateId,
  draft?: boolean,
): Promise<StudioMetadata> {
  const base = await buildPuckSpikeMetadata(ctx, draft);
  const [reviews] = await Promise.all([
    loadStorefrontReviews(ctx.owner.id, 6),
  ]);

  const categories = ctx.categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    imageUrl: c.imageUrl,
  }));

  const fulfilmentOptions = ctx.fulfilmentOptions;
  const customPages = ensureCustomPages(ctx.storefront.draftConfig);
  const usePublished = !draft && ctx.storefront.isPublished;
  const configSource =
    usePublished && ctx.storefront.publishedConfig
      ? ctx.storefront.publishedConfig
      : ctx.storefront.draftConfig;
  const publishedPages = ensureCustomPages(configSource);

  const pagesForNav = draft ? customPages : publishedPages;
  const blogSettings = ensureBlogSettings(configSource);

  return {
    ...base,
    templateId,
    categories,
    reviews,
    fulfilmentOptions,
    standId: ctx.stand.id,
    customNavPages: buildStudioHeaderNav(
      pagesForNav,
      blogSettings,
      ctx.storefront.slug,
      draft,
      base.basePath,
    ),
    customFooterPages: footerPagesFromCustomPages(
      pagesForNav,
      ctx.storefront.slug,
      draft,
      base.basePath,
    ),
  };
}
