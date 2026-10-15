import { loadStorefrontContext } from "@/lib/catalogue/storefront";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";
import { storefrontPublicUrl } from "@/lib/tenancy/public-url";
import { robotsTxt } from "@/lib/storefront/technical-seo/serialize";

export const revalidate = 3600;

const TEXT = { "Content-Type": "text/plain; charset=utf-8" };

/** The store's robots.txt; seller domains reach it at `/robots.txt`. Unpublished stores are closed to crawlers. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const ctx = await loadStorefrontContext(slug);
    if (!ctx) return new Response(robotsTxt({ disallow: ["/"] }), { headers: TEXT });
    const primaryCustomHostname = await loadPrimaryCustomHostname(ctx.storefront.id);
    const body = robotsTxt({
      allow: ["/"],
      disallow: ["/studio-preview", "/craft-preview", "/puck-preview", "/*?draft=1"],
      sitemap: storefrontPublicUrl(slug, { path: "/sitemap.xml", primaryCustomHostname }),
    });
    return new Response(body, { headers: TEXT });
  } catch (error) {
    console.error("store robots.txt failed", slug, error);
    return new Response(robotsTxt({ disallow: [] }), { headers: TEXT });
  }
}
