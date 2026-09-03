import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import {
  buildStorefrontPageMetadata,
  seoConfigSource,
} from "@/lib/studio/resolve-seo-metadata";
import StorefrontPageShell from "@/components/storefront/StorefrontPageShell";
import StorefrontGoToCartBar from "@/components/storefront/StorefrontGoToCartBar";
import BlogPostIndex from "@/components/storefront/BlogPostIndex";
import StudioPublicSections from "@/lib/studio/public-render";
import { resolveStudioPublicContext } from "@/lib/studio/public-context";
import { loadCustomPageFromContext } from "@/lib/studio/load-custom-page";
import { studioPageNodes } from "@/lib/studio/storage";
import { BLOG_INDEX_BUILTIN_ID } from "@/lib/studio/custom-pages";
import {
  loadBlogPostsFromContext,
  loadBlogSettingsFromContext,
  loadBlogTopicsFromContext,
} from "@/lib/studio/load-blog";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ draft?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const draft = sp.draft === "1";
  try {
    const ctx = await loadStorefrontPage(slug, draft);
    const settings = loadBlogSettingsFromContext(ctx, draft);
    const configRaw = seoConfigSource(
      ctx.storefront.draftConfig,
      ctx.storefront.publishedConfig,
      ctx.storefront.isPublished && !draft,
    );
    return buildStorefrontPageMetadata({
      branding: ctx.branding,
      slug: ctx.storefront.slug,
      published: ctx.storefront.isPublished && !draft,
      configRaw,
      entityType: "page",
      entityId: BLOG_INDEX_BUILTIN_ID,
      defaults: {
        title: settings.indexTitle,
        description: `Blog from ${ctx.branding.headline}`,
      },
      path: "/blog",
    });
  } catch {
    return { title: "Blog", robots: { index: false, follow: false } };
  }
}

export default async function StorefrontBlogIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ draft?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const draft = sp.draft === "1";
  const ctx = await loadStorefrontPage(slug, draft);
  const settings = loadBlogSettingsFromContext(ctx, draft);
  if (!settings.enabled) notFound();

  const page = loadCustomPageFromContext(ctx, "blog", draft);
  if (!page?.enabled) notFound();

  const studioCtx = await resolveStudioPublicContext(ctx, draft);
  const nodes =
    studioCtx.active ? studioPageNodes(studioCtx.studio, BLOG_INDEX_BUILTIN_ID) : undefined;
  const posts = loadBlogPostsFromContext(ctx, draft);
  const topics = loadBlogTopicsFromContext(ctx, draft);
  const basePath = studioCtx.active ? studioCtx.metadata.basePath : undefined;

  return (
    <StorefrontPageShell ctx={ctx} draft={draft} activePage="blog">
      {nodes && studioCtx.active ? (
        <StudioPublicSections nodes={nodes} metadata={studioCtx.metadata} />
      ) : null}
      <BlogPostIndex
        posts={posts}
        topics={topics}
        storefrontSlug={ctx.storefront.slug}
        draft={draft}
        basePath={basePath}
        indexTitle={settings.indexTitle}
        studioActive={studioCtx.active}
      />
      <StorefrontGoToCartBar standSlug={ctx.stand.slug} branding={ctx.branding} />
    </StorefrontPageShell>
  );
}
