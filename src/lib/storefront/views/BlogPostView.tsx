import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import {
  buildStorefrontPageMetadata,
  seoConfigSource,
} from "@/lib/studio/resolve-seo-metadata";
import { sanitizeSignHtml } from "@/lib/sanitize-sign-html";
import StorefrontPageShell from "@/components/storefront/StorefrontPageShell";
import StorefrontGoToCartBar from "@/components/storefront/StorefrontGoToCartBar";
import BlogPostArticle from "@/components/storefront/BlogPostArticle";
import { resolveStudioPublicContext } from "@/lib/studio/public-context";
import {
  loadBlogPostFromContext,
  loadBlogSettingsFromContext,
  loadBlogTopicsFromContext,
} from "@/lib/studio/load-blog";
import { buildStorefrontBreadcrumbs } from "@/lib/storefront/technical-seo/breadcrumbs";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";
import type { PageSeo } from "@/lib/seo/graph/page-graph";
import { blogPostingNode } from "@/lib/seo/graph/content";
import { blogPostRelativePath, mainBlogTopic } from "@/lib/studio/blog-topics";
import { redirectWithinStorefront } from "@/lib/storefront/clean-redirect";

type ViewProps = { slug: string; topicSlug?: string; postSlug: string; draft: boolean };

export async function blogPostViewMetadata({ slug, postSlug, draft }: ViewProps): Promise<Metadata> {
  try {
    const ctx = await loadStorefrontPage(slug, draft);
    const post = loadBlogPostFromContext(ctx, postSlug, draft);
    const topics = loadBlogTopicsFromContext(ctx, draft);
    const configRaw = seoConfigSource(
      ctx.storefront.draftConfig,
      ctx.storefront.publishedConfig,
      ctx.storefront.isPublished && !draft,
    );
    return buildStorefrontPageMetadata({
      branding: ctx.branding,
      slug: ctx.storefront.slug,
      published: ctx.storefront.isPublished && !draft && post?.status === "published",
      configRaw,
      entityType: "blog",
      entityId: post?.id,
      defaults: {
        title: post?.title ?? "Post",
        description: post?.excerpt ?? post?.title ?? "Post",
        ogImageUrl: post?.featuredImageUrl,
      },
      path: post ? blogPostRelativePath(post, topics) : undefined,
    });
  } catch {
    return { title: "Post", robots: { index: false, follow: false } };
  }
}

/** A post at `/{category}/{post}`; any other category in the URL redirects to the main one. */
export default async function BlogPostView({ slug, topicSlug, postSlug, draft }: ViewProps) {
  const ctx = await loadStorefrontPage(slug, draft);
  const settings = loadBlogSettingsFromContext(ctx, draft);
  if (!settings.enabled) notFound();

  const post = loadBlogPostFromContext(ctx, postSlug, draft);
  if (!post) notFound();

  const topics = loadBlogTopicsFromContext(ctx, draft);
  const mainTopic = mainBlogTopic(post, topics);
  const canonicalPath = blogPostRelativePath(post, topics);
  if (topicSlug !== mainTopic.slug) await redirectWithinStorefront(ctx.storefront.slug, canonicalPath, draft);
  const studioCtx = await resolveStudioPublicContext(ctx, draft);
  const bodyHtml = sanitizeSignHtml(post.bodyHtml, false, 50000);
  const basePath = studioCtx.active ? studioCtx.metadata.basePath : undefined;

  const primaryCustomHostname =
    draft || post.status !== "published"
      ? null
      : await loadPrimaryCustomHostname(ctx.storefront.id);
  const breadcrumbSegments = [
    { label: ctx.branding.headline, path: "/" },
    { label: settings.indexTitle, path: "/blog" },
    { label: mainTopic.name, path: `/${mainTopic.slug}` },
    { label: post.title },
  ];
  const breadcrumbs = buildStorefrontBreadcrumbs(
    ctx.storefront.slug,
    breadcrumbSegments,
    primaryCustomHostname,
  );
  const seo: PageSeo | undefined =
    draft || post.status !== "published"
      ? undefined
      : {
          path: canonicalPath,
          name: post.title,
          description: post.excerpt,
          imageUrl: post.featuredImageUrl,
          breadcrumb: breadcrumbSegments,
          nodes: [
            ({ facts, pageUrl, language }) =>
              blogPostingNode({
                pageUrl,
                homeUrl: facts.homeUrl,
                title: post.title,
                description: post.excerpt,
                imageUrl: post.featuredImageUrl,
                publishedAt: post.publishedAt,
                updatedAt: post.updatedAt,
                section: mainTopic.name,
                hasFounder: !!facts.profile.founder,
                language,
              }),
          ],
        };

  return (
    <StorefrontPageShell
      ctx={ctx}
      draft={draft}
      activePage="blog"
      breadcrumbs={breadcrumbs}
      seo={seo}
    >
      <BlogPostArticle
        post={post}
        topics={topics}
        storefrontSlug={ctx.storefront.slug}
        draft={draft}
        basePath={basePath}
        bodyHtml={bodyHtml}
        studioActive={studioCtx.active}
      />
      <StorefrontGoToCartBar standSlug={ctx.stand.slug} branding={ctx.branding} />
    </StorefrontPageShell>
  );
}
