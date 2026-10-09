import type { MetadataRoute } from "next";
import { loadStorefrontContext } from "@/lib/catalogue/storefront";
import { storefrontPublicUrl } from "@/lib/tenancy/public-url";

export default async function storefrontRobots({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<MetadataRoute.Robots> {
  const { slug } = await params;
  const ctx = await loadStorefrontContext(slug);
  const sitemap = storefrontPublicUrl(slug, { path: "/sitemap.xml", forcePath: true });

  if (!ctx) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/studio-preview",
        "/craft-preview",
        "/puck-preview",
        "/*?draft=1",
      ],
    },
    sitemap,
  };
}
