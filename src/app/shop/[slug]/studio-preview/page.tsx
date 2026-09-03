import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import { storefrontMetadata } from "@/lib/storefront/seo";
import { resolveStudioPublicContext } from "@/lib/studio/public-context";
import StudioPublicSections from "@/lib/studio/public-render";
import StorefrontPageShell from "@/components/storefront/StorefrontPageShell";
import StorefrontGoToCartBar from "@/components/storefront/StorefrontGoToCartBar";

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
    return {
      ...storefrontMetadata({
        branding: ctx.branding,
        slug: ctx.storefront.slug,
        published: ctx.storefront.isPublished && !draft,
      }),
      title: `Website preview · ${ctx.branding.headline}`,
      robots: { index: false, follow: false },
    };
  } catch {
    return { title: "Preview", robots: { index: false, follow: false } };
  }
}

export default async function StudioPreviewPage({
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
  const studioCtx = await resolveStudioPublicContext(ctx, draft);

  if (!studioCtx.active) notFound();

  return (
    <>
      <StorefrontPageShell ctx={ctx} draft={draft} activePage="home">
        <StudioPublicSections nodes={studioCtx.studio.nodes} metadata={studioCtx.metadata} />
      </StorefrontPageShell>
      <StorefrontGoToCartBar standSlug={ctx.stand.slug} branding={ctx.branding} />
    </>
  );
}
