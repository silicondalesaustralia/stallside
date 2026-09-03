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
import { storefrontPublicUrl } from "@/lib/tenancy/public-url";
import { buildStorefrontBreadcrumbs } from "@/lib/storefront/technical-seo/breadcrumbs";
import {
  articleSchemaNode,
  storefrontSchemaGraph,
} from "@/lib/storefront/technical-seo/schema";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; postSlug: string }>;
  searchParams: Promise<{ draft?: string }>;
}): Promise<Metadata> {
  const { slug, postSlug } = await params;
  const sp = await searchParams;
  const draft = sp.draft === "1";
  try {
    const ctx = await loadStorefrontPage(slug, draft);
    const post = loadBlogPostFromContext(ctx, postSlug, draft);
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
      path: post ? `/blog/${encodeURIComponent(post.slug)}` : undefined,
    });
  } catch {
    return { title: "Post", robots: { index: false, follow: false } };
  }
}

export default async function StorefrontBlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; postSlug: string }>;
  searchParams: Promise<{ draft?: string }>;
}) {
  const { slug, postSlug } = await params;
  const sp = await searchParams;
  const draft = sp.draft === "1";
  const ctx = await loadStorefrontPage(slug, draft);
  const settings = loadBlogSettingsFromContext(ctx, draft);
  if (!settings.enabled) notFound();

  const post = loadBlogPostFromContext(ctx, postSlug, draft);
  if (!post) notFound();

  const topics = loadBlogTopicsFromContext(ctx, draft);
  const studioCtx = await resolveStudioPublicContext(ctx, draft);
  const bodyHtml = sanitizeSignHtml(post.bodyHtml, false, 50000);
  const basePath = studioCtx.active ? studioCtx.metadata.basePath : undefined;

  const primaryCustomHostname =
    draft || post.status !== "published"
      ? null
      : await loadPrimaryCustomHostname(ctx.storefront.id);
  const pageUrl = storefrontPublicUrl(ctx.storefront.slug, {
    path: `/blog/${post.slug}`,
    primaryCustomHostname,
  });
  const breadcrumbSegments = [
    { label: ctx.branding.headline, path: "/" },
    { label: settings.indexTitle, path: "/blog" },
    { label: post.title },
  ];
  const breadcrumbs = buildStorefrontBreadcrumbs(
    ctx.storefront.slug,
    breadcrumbSegments,
    primaryCustomHostname,
  );
  const schemaGraph =
    draft || post.status !== "published"
      ? undefined
      : storefrontSchemaGraph({
          slug: ctx.storefront.slug,
          branding: ctx.branding,
          pageUrl,
          breadcrumbSegments,
          primaryCustomHostname,
          extra: [
            articleSchemaNode({
              post,
              pageUrl,
              branding: ctx.branding,
            }),
          ],
        });

  return (
    <StorefrontPageShell
      ctx={ctx}
      draft={draft}
      activePage="blog"
      breadcrumbs={breadcrumbs}
      schemaGraph={schemaGraph}
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
