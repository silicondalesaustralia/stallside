import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import {
  buildStorefrontPageMetadata,
  seoConfigSource,
} from "@/lib/studio/resolve-seo-metadata";
import StorefrontPageShell from "@/components/storefront/StorefrontPageShell";
import StorefrontGoToCartBar from "@/components/storefront/StorefrontGoToCartBar";
import StudioPublicSections from "@/lib/studio/public-render";
import { resolveStudioPublicContext } from "@/lib/studio/public-context";
import { loadCustomPageFromContext } from "@/lib/studio/load-custom-page";
import { studioPageNodes } from "@/lib/studio/storage";
import { redirectBuiltinCustomPage } from "@/lib/studio/builtin-pages";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; pageSlug: string }>;
  searchParams: Promise<{ draft?: string }>;
}): Promise<Metadata> {
  const { slug, pageSlug } = await params;
  const sp = await searchParams;
  const draft = sp.draft === "1";
  try {
    const ctx = await loadStorefrontPage(slug, draft);
    const page = loadCustomPageFromContext(ctx, pageSlug, draft);
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
      entityId: page?.id,
      defaults: {
        title: page?.title ?? "Page",
        description: page?.navLabel ?? page?.title ?? "Page",
      },
      path: page ? `/pages/${encodeURIComponent(page.slug)}` : undefined,
    });
  } catch {
    return { title: "Page", robots: { index: false, follow: false } };
  }
}

export default async function StorefrontCustomPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; pageSlug: string }>;
  searchParams: Promise<{ draft?: string }>;
}) {
  const { slug, pageSlug } = await params;
  const sp = await searchParams;
  const draft = sp.draft === "1";
  redirectBuiltinCustomPage(pageSlug, slug);
  const ctx = await loadStorefrontPage(slug, draft);
  const page = loadCustomPageFromContext(ctx, pageSlug, draft);
  if (!page || page.routeKind === "builtin") notFound();

  const studioCtx = await resolveStudioPublicContext(ctx, draft);
  const nodes =
    studioCtx.active ? studioPageNodes(studioCtx.studio, page.id) : undefined;

  return (
    <StorefrontPageShell ctx={ctx} draft={draft} activePage={page.slug}>
      {nodes && studioCtx.active ? (
        <StudioPublicSections nodes={nodes} metadata={studioCtx.metadata} />
      ) : (
        <div className="storefront-page-content storefront-page-content--narrow">
          <h1 className="studio-heading">{page.title}</h1>
          <p className="mt-4 text-[var(--muted)]">This page has not been published yet.</p>
        </div>
      )}
      <StorefrontGoToCartBar standSlug={ctx.stand.slug} branding={ctx.branding} />
    </StorefrontPageShell>
  );
}
