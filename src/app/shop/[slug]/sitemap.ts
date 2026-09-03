import type { MetadataRoute } from "next";
import { loadStorefrontContext } from "@/lib/catalogue/storefront";
import { buildStorefrontSitemap } from "@/lib/storefront/technical-seo/sitemap";

export const revalidate = 3600;

export default async function storefrontSitemap({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<MetadataRoute.Sitemap> {
  const { slug } = await params;
  const ctx = await loadStorefrontContext(slug);
  if (!ctx) return [];
  return buildStorefrontSitemap(ctx);
}
