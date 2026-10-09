import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import { storefrontMetadata } from "@/lib/storefront/seo";
import StorefrontShell from "@/components/storefront/StorefrontShell";
import { storefrontEnabledPages } from "@/lib/storefront/page-loader";
import {
  extractPuckSpike,
  readPuckHomeFromStorefrontJson,
} from "@/lib/puck/spike-storage";
import { buildDefaultSpikeHome } from "@/lib/puck/spike-defaults";
import { parseStorefrontConfig } from "@/lib/storefront/config";
import { buildPuckSpikeMetadata } from "@/lib/puck/build-metadata";
import PuckSpikeRenderer from "@/components/puck/PuckSpikeRenderer";
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
      title: `Puck preview · ${ctx.branding.headline}`,
      robots: { index: false, follow: false },
    };
  } catch {
    return { title: "Preview", robots: { index: false, follow: false } };
  }
}

export default async function PuckPreviewPage({
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
  let home = readPuckHomeFromStorefrontJson(
    ctx.storefront.draftConfig,
    usePublished,
    ctx.storefront.publishedConfig,
  );

  if (!home) {
    const legacy = parseStorefrontConfig(
      usePublished && ctx.storefront.publishedConfig
        ? ctx.storefront.publishedConfig
        : ctx.storefront.draftConfig,
    );
    home = buildDefaultSpikeHome({
      config: legacy,
      headline: ctx.branding.headline,
      subheadline: ctx.branding.subheadline,
      about: ctx.branding.about,
      businessMode: ctx.businessMode,
    });
  }

  if (!extractPuckSpike(ctx.storefront.draftConfig) && draft) {
    // Draft preview without puck data yet — still render migrated default
  }

  if (!home.content.length) notFound();

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
      <PuckSpikeRenderer data={home} metadata={metadata} />
      <StorefrontGoToCartBar
        standSlug={ctx.stand.slug}
        branding={ctx.branding}
      />
    </StorefrontShell>
  );
}
