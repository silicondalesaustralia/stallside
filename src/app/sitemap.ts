import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/legal";
import { prisma } from "@/lib/prisma";
import { isDemoStandSlug } from "@/lib/demo";
import {
  getAllArticles,
  newsArticlePath,
  newsIndexPath,
} from "@/lib/farms-stand-news";
import { isReservedProductSlug } from "@/lib/slug";
import {
  standCatalogPath,
  standProductPath,
} from "@/lib/stand-seo";
import { businessPageProductWhere } from "@/lib/product-visibility";
import {
  AU_HUB_PATH,
  US_HUB_PATH,
  councilsPath,
  localAgenciesPath,
  isPageIndexable,
  jurisdictionPathFor,
  loadAllAuJurisdictionRecords,
  loadAllUsJurisdictionRecords,
  loadJurisdictionCouncils,
} from "@/lib/jurisdictions";

/** Refresh storefront URLs hourly so new stands/products show up for crawlers. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const marketing = [
    "",
    "/stall",
    "/pre-orders",
    "/pre-orders/bakers",
    "/pre-orders/farm-stalls",
    "/pre-orders/firewood",
    "/stall/farm-gate",
    "/stall/honesty-parking",
    "/stall/campsites",
    "/stall/community-fridges",
    "/about",
    "/gallery",
    "/testimonials",
    "/contact",
    "/privacy",
    "/terms",
    newsIndexPath(),
  ] as const;

  const entries: MetadataRoute.Sitemap = marketing.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));

  const publishedAu = loadAllAuJurisdictionRecords().filter(isPageIndexable);
  if (publishedAu.length > 0) {
    entries.push({
      url: `${SITE_URL}${AU_HUB_PATH}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    });
    for (const record of publishedAu) {
      entries.push({
        url: `${SITE_URL}${jurisdictionPathFor(record)}`,
        lastModified: new Date(record.meta.last_verified),
        changeFrequency: "monthly",
        priority: 0.7,
      });
      entries.push({
        url: `${SITE_URL}${councilsPath(record.slug)}`,
        lastModified: new Date(record.meta.last_verified),
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }

  const publishedUs = loadAllUsJurisdictionRecords().filter(isPageIndexable);
  if (publishedUs.length > 0) {
    entries.push({
      url: `${SITE_URL}${US_HUB_PATH}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    });
    for (const record of publishedUs) {
      entries.push({
        url: `${SITE_URL}${jurisdictionPathFor(record)}`,
        lastModified: new Date(record.meta.last_verified),
        changeFrequency: "monthly",
        priority: 0.7,
      });
      if (loadJurisdictionCouncils(record.code, "US")) {
        entries.push({
          url: `${SITE_URL}${localAgenciesPath(record.slug)}`,
          lastModified: new Date(record.meta.last_verified),
          changeFrequency: "monthly",
          priority: 0.5,
        });
      }
    }
  }

  for (const article of getAllArticles()) {
    entries.push({
      url: `${SITE_URL}${newsArticlePath(article.slug)}`,
      lastModified: new Date(article.updatedAt ?? article.publishedAt),
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  try {
    const stands = await prisma.stand.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
        products: {
          where: businessPageProductWhere,
          select: { slug: true, updatedAt: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    for (const stand of stands) {
      if (isDemoStandSlug(stand.slug)) continue;

      entries.push({
        url: `${SITE_URL}${standCatalogPath(stand.slug)}`,
        lastModified: stand.updatedAt,
        changeFrequency: "daily",
        priority: 0.8,
      });

      for (const product of stand.products) {
        if (!product.slug || isReservedProductSlug(product.slug)) continue;
        entries.push({
          url: `${SITE_URL}${standProductPath(stand.slug, product.slug)}`,
          lastModified: product.updatedAt,
          changeFrequency: "daily",
          priority: 0.7,
        });
      }
    }
  } catch (error) {
    console.error("Sitemap stand query failed", error);
  }

  try {
    const storefronts = await prisma.storefront.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    });
    for (const sf of storefronts) {
      entries.push({
        url: `${SITE_URL}/shop/${encodeURIComponent(sf.slug)}/sitemap.xml`,
        lastModified: sf.publishedAt ?? sf.updatedAt,
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
  } catch (error) {
    console.error("Sitemap storefront query failed", error);
  }

  return entries;
}
