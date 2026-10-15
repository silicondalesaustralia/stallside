import { loadStorefrontContext } from "@/lib/catalogue/storefront";
import { buildStorefrontSitemap } from "@/lib/storefront/technical-seo/sitemap";
import { sitemapXml } from "@/lib/storefront/technical-seo/serialize";

export const revalidate = 3600;

/** The store's sitemap; seller domains reach it at `/sitemap.xml`. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const ctx = await loadStorefrontContext(slug);
    const entries = ctx ? await buildStorefrontSitemap(ctx) : [];
    return new Response(sitemapXml(entries), {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  } catch (error) {
    console.error("store sitemap failed", slug, error);
    return new Response("Sitemap unavailable", { status: 500 });
  }
}
