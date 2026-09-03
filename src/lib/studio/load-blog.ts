import type { StorefrontContext } from "@/lib/catalogue/storefront";
import {
  ensureBlogSettings,
  extractBlogPosts,
  extractBlogTopics,
  listVisibleBlogPosts,
  type StorefrontBlogPost,
  type StorefrontBlogSettings,
  type StorefrontBlogTopic,
} from "./blog";

export function blogConfigSource(
  ctx: NonNullable<StorefrontContext>,
  draft?: boolean,
): unknown {
  const usePublished = !draft && ctx.storefront.isPublished;
  return usePublished && ctx.storefront.publishedConfig
    ? ctx.storefront.publishedConfig
    : ctx.storefront.draftConfig;
}

export function loadBlogSettingsFromContext(
  ctx: NonNullable<StorefrontContext>,
  draft?: boolean,
): StorefrontBlogSettings {
  return ensureBlogSettings(blogConfigSource(ctx, draft));
}

export function loadBlogPostsFromContext(
  ctx: NonNullable<StorefrontContext>,
  draft?: boolean,
): StorefrontBlogPost[] {
  const raw = blogConfigSource(ctx, draft);
  return listVisibleBlogPosts(extractBlogPosts(raw), draft);
}

export function loadBlogTopicsFromContext(
  ctx: NonNullable<StorefrontContext>,
  draft?: boolean,
): StorefrontBlogTopic[] {
  return extractBlogTopics(blogConfigSource(ctx, draft));
}

export function loadBlogPostFromContext(
  ctx: NonNullable<StorefrontContext>,
  postSlug: string,
  draft?: boolean,
): StorefrontBlogPost | null {
  const posts = loadBlogPostsFromContext(ctx, draft);
  const key = postSlug.trim().toLowerCase();
  const hit = posts.find((p) => p.slug === key);
  return hit ?? null;
}

/** Draft editing always reads/writes draftConfig posts list. */
export function loadAllDraftBlogPosts(ctx: NonNullable<StorefrontContext>): StorefrontBlogPost[] {
  return extractBlogPosts(ctx.storefront.draftConfig).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function loadAllDraftBlogTopics(ctx: NonNullable<StorefrontContext>): StorefrontBlogTopic[] {
  return extractBlogTopics(ctx.storefront.draftConfig);
}
