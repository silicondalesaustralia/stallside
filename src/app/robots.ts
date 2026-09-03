import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/legal";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/admin",
        "/api",
        "/login",
        "/onboarding",
        "/checkout",
        "/s/*/cart",
        "/shop/*/studio-preview",
        "/shop/*/craft-preview",
        "/shop/*/puck-preview",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
