import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import { buildStorefrontPageMetadata, seoConfigSource } from "@/lib/studio/resolve-seo-metadata";
import StorefrontPageShell from "@/components/storefront/StorefrontPageShell";
import StorefrontGoToCartBar from "@/components/storefront/StorefrontGoToCartBar";
import BlogPostIndex from "@/components/storefront/BlogPostIndex";
import { currentStorefrontBasePath } from "@/lib/tenancy/request-base-path";
import {
  loadBlogPostsFromContext,
  loadBlogSettingsFromContext,
  loadBlogTopicsFromContext,
} from "@/lib/studio/load-blog";
import { postsInBlogTopic } from "@/lib/studio/blog-topics";

type ViewProps = { slug: string; topicSlug: string; draft: boolean };

async function loadTopic({ slug, topicSlug, draft }: ViewProps) {
  const ctx = await loadStorefrontPage(slug, draft);
  const topics = loadBlogTopicsFromContext(ctx, draft);
  const key = decodeURIComponent(topicSlug).trim().toLowerCase();
  const topic = topics.find((t) => t.slug === key) ?? null;
  return { ctx, topics, topic };
}

export async function blogTopicViewMetadata(props: ViewProps): Promise<Metadata> {
  try {
    const { ctx, topic } = await loadTopic(props);
    if (!topic) return { title: "Blog", robots: { index: false, follow: false } };
    const published = ctx.storefront.isPublished && !props.draft;
    return buildStorefrontPageMetadata({
      branding: ctx.branding,
      slug: ctx.storefront.slug,
      published,
      configRaw: seoConfigSource(ctx.storefront.draftConfig, ctx.storefront.publishedConfig, published),
      entityType: "page",
      entityId: `blog-topic-${topic.id}`,
      defaults: { title: topic.name, description: `${topic.name} from ${ctx.branding.headline}` },
      path: `/${encodeURIComponent(topic.slug)}`,
    });
  } catch {
    return { title: "Blog", robots: { index: false, follow: false } };
  }
}

/** `/{blog-category}`: the posts filed under one blog category. */
export default async function BlogTopicView(props: ViewProps) {
  const { ctx, topics, topic } = await loadTopic(props);
  const settings = loadBlogSettingsFromContext(ctx, props.draft);
  if (!settings.enabled || !topic) notFound();
  const posts = postsInBlogTopic(loadBlogPostsFromContext(ctx, props.draft), topic, topics);
  const basePath = await currentStorefrontBasePath(ctx.storefront.slug);
  return (
    <StorefrontPageShell ctx={ctx} draft={props.draft} activePage="blog">
      <BlogPostIndex
        posts={posts}
        topics={topics}
        storefrontSlug={ctx.storefront.slug}
        draft={props.draft}
        basePath={basePath}
        indexTitle={topic.name}
        studioActive={false}
      />
      <StorefrontGoToCartBar standSlug={ctx.stand.slug} branding={ctx.branding} />
    </StorefrontPageShell>
  );
}
