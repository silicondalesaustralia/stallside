import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadStorefrontPage, storefrontEnabledPages } from "@/lib/storefront/page-loader";
import { storefrontMetadata } from "@/lib/storefront/seo";
import StorefrontShell from "@/components/storefront/StorefrontShell";
import { readCraftNodesFromStorefrontJson } from "@/lib/craft/storage";
import { buildPuckSpikeMetadata } from "@/lib/puck/build-metadata";
import CraftPublicRenderer from "@/components/craft/CraftPublicRenderer";
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
      title: `Craft preview · ${ctx.branding.headline}`,
      robots: { index: false, follow: false },
    };
  } catch {
    return { title: "Preview", robots: { index: false, follow: false } };
  }
}

export default async function CraftPreviewPage({
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

  const usePublished = !draft && ctx.storefront.isPublished;
  const nodes = readCraftNodesFromStorefrontJson(
    ctx.storefront.draftConfig,
    usePublished,
    ctx.storefront.publishedConfig,
  );

  if (!nodes) notFound();

  const metadata = await buildPuckSpikeMetadata(ctx, draft);
  const enabledPages = storefrontEnabledPages(ctx.config);

  return (
    <StorefrontShell
      storefrontSlug={ctx.storefront.slug}
      standSlug={ctx.stand.slug}
      branding={ctx.branding}
      activePage="home"
      enabledPages={enabledPages}
      draft={draft}
      isDraftPreview={ctx.isDraftPreview}
      fulfilmentOptions={ctx.fulfilmentOptions}
      currency={ctx.stand.currency}
    >
      <CraftPublicRenderer nodes={nodes} metadata={metadata} />
      <StorefrontGoToCartBar standSlug={ctx.stand.slug} branding={ctx.branding} />
    </StorefrontShell>
  );
}
