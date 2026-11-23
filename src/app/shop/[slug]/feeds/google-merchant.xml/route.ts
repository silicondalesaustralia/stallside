import { serializeGmcXml } from "@/lib/product-feeds/gmc-xml";
import { loadProductFeedCatalog } from "@/lib/product-feeds/load-catalog";

export const revalidate = 3600;

/** Google Merchant Center RSS feed; custom domains reach it at `/feeds/google-merchant.xml`. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const catalog = await loadProductFeedCatalog(slug);
    if (!catalog) {
      return new Response("Store not found", { status: 404 });
    }
    return new Response(serializeGmcXml(catalog), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("GMC feed failed", slug, error);
    return new Response("Feed unavailable", { status: 500 });
  }
}
