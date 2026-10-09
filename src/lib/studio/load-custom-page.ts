import type { StorefrontContext } from "@/lib/catalogue/storefront";
import {
  ensureCustomPages,
  findCustomPageBySlug,
  type StorefrontCustomPage,
} from "./custom-pages";
import { readStudioFromStorefrontJson, studioPageNodes } from "./storage";
import { resolveStudioPublicContext } from "./public-context";

export function loadCustomPageFromContext(
  ctx: NonNullable<StorefrontContext>,
  pageSlug: string,
  draft?: boolean,
): StorefrontCustomPage | null {
  const usePublished = !draft && ctx.storefront.isPublished;
  const configSource =
    usePublished && ctx.storefront.publishedConfig
      ? ctx.storefront.publishedConfig
      : ctx.storefront.draftConfig;
  const pages = ensureCustomPages(configSource);
  const page = findCustomPageBySlug(pages, pageSlug);
  if (!page || !page.enabled) return null;
  return page;
}

export async function customPageHasStudioContent(
  ctx: NonNullable<StorefrontContext>,
  page: StorefrontCustomPage,
  draft?: boolean,
): Promise<boolean> {
  const studioCtx = await resolveStudioPublicContext(ctx, draft);
  if (!studioCtx.active) return false;
  return Boolean(studioPageNodes(studioCtx.studio, page.id));
}
