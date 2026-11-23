import { serializeChatgptCsv } from "@/lib/product-feeds/chatgpt-csv";
import { loadProductFeedCatalog } from "@/lib/product-feeds/load-catalog";

export const revalidate = 3600;

/** ChatGPT Business Hub CSV feed; custom domains reach it at `/feeds/chatgpt-products.csv`. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const catalog = await loadProductFeedCatalog(slug);
    if (!catalog) {
      return new Response("Store not found", { status: 404 });
    }
    return new Response(serializeChatgptCsv(catalog), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'inline; filename="chatgpt-products.csv"',
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("ChatGPT feed failed", slug, error);
    return new Response("Feed unavailable", { status: 500 });
  }
}
