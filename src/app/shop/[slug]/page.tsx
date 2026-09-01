import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadStorefrontPage, storefrontEnabledPages } from "@/lib/storefront/page-loader";
import { storefrontMetadata } from "@/lib/storefront/seo";
import StorefrontShell from "@/components/storefront/StorefrontShell";
import StorefrontHomeContent from "@/components/storefront/StorefrontHomeContent";
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
    return storefrontMetadata({
      branding: ctx.branding,
      slug: ctx.storefront.slug,
      published: ctx.storefront.isPublished && !draft,
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
      <StorefrontHomeContent ctx={ctx} draft={draft} />
      <StorefrontGoToCartBar standSlug={ctx.stand.slug} branding={ctx.branding} />
    </StorefrontShell>
  );
}
