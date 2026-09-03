import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import {
  buildStorefrontPageMetadata,
  homeSeoDefaults,
  seoConfigSource,
} from "@/lib/studio/resolve-seo-metadata";
import { resolveStudioPublicContext } from "@/lib/studio/public-context";
import { greenValleyDemoOverride } from "@/lib/demo/green-valley/runtime-override";
import StudioPublicSections from "@/lib/studio/public-render";
import StorefrontPageShell from "@/components/storefront/StorefrontPageShell";
import StorefrontHomeContent from "@/components/storefront/StorefrontHomeContent";
import StorefrontGoToCartBar from "@/components/storefront/StorefrontGoToCartBar";
import { storefrontPublicUrl } from "@/lib/tenancy/public-url";
import { storefrontSchemaGraph } from "@/lib/storefront/technical-seo/schema";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";

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
      entityType: "home",
      defaults: homeSeoDefaults(ctx.branding),
    });
  } catch {
    return { title: "Shop", robots: { index: false, follow: false } };
  }
}

export default async function PublicStorefrontHomePage({
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
  if (!ctx.config.pages.home?.enabled) notFound();

  const studioCtx = await resolveStudioPublicContext(
    ctx,
    draft,
    draft ? undefined : await greenValleyDemoOverride(ctx, { homeNodes: true }),
  );
  const primaryCustomHostname = draft
    ? null
    : await loadPrimaryCustomHostname(ctx.storefront.id);
  const pageUrl = storefrontPublicUrl(ctx.storefront.slug, {
    primaryCustomHostname,
  });
  const schemaGraph = draft
    ? undefined
    : storefrontSchemaGraph({
        slug: ctx.storefront.slug,
        branding: ctx.branding,
        pageUrl,
        primaryCustomHostname,
      });

  return (
    <StorefrontPageShell
      ctx={ctx}
      draft={draft}
      activePage="home"
      schemaGraph={schemaGraph}
    >
      {studioCtx.active ? (
        <StudioPublicSections nodes={studioCtx.studio.nodes} metadata={studioCtx.metadata} />
      ) : (
        <StorefrontHomeContent ctx={ctx} draft={draft} />
      )}
      <StorefrontGoToCartBar standSlug={ctx.stand.slug} branding={ctx.branding} />
    </StorefrontPageShell>
  );
}
