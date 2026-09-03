import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { MenuKind } from "@/generated/prisma/client";
import type { StorefrontContext } from "@/lib/catalogue/storefront";
import { isReservedProductSlug } from "@/lib/slug";
import { ensureCustomPages } from "@/lib/studio/custom-pages";
import {
  ensureBlogSettings,
  extractBlogPosts,
  listVisibleBlogPosts,
} from "@/lib/studio/blog";
import { resolveStorefrontEntitySeo } from "@/lib/studio/resolve-seo-metadata";
import { seoRobotsIndex } from "@/lib/studio/seo-settings";
import { storefrontPublicUrl } from "@/lib/tenancy/public-url";
import { loadPrimaryCustomHostname } from "@/lib/domains/resolve";

function includeEntity(
  configRaw: unknown,
  published: boolean,
  entityType: "home" | "page" | "blog" | "product" | "category" | "menu",
  entityId?: string,
): boolean {
  const resolved = resolveStorefrontEntitySeo(configRaw, entityType, entityId, {
    title: "Page",
    description: "Page",
  });
  return seoRobotsIndex(resolved.robots, published);
}

function entry(
  slug: string,
  path: string,
  lastModified: Date,
  priority: number,
  primaryCustomHostname: string | null,
): MetadataRoute.Sitemap[number] {
  return {
    url: storefrontPublicUrl(slug, { path, primaryCustomHostname }),
    lastModified,
    changeFrequency: "weekly",
    priority,
  };
}

export async function buildStorefrontSitemap(
  ctx: NonNullable<StorefrontContext>,
): Promise<MetadataRoute.Sitemap> {
  const { storefront, stand, config, products, categories } = ctx;
  const slug = storefront.slug;
  const published = storefront.isPublished;
  const configRaw = storefront.publishedConfig ?? storefront.draftConfig;
  const lastModified = storefront.publishedAt ?? storefront.updatedAt;
  const primaryCustomHostname = await loadPrimaryCustomHostname(storefront.id);
  const entries: MetadataRoute.Sitemap = [];

  if (includeEntity(configRaw, published, "home")) {
    entries.push(entry(slug, "/", lastModified, 1, primaryCustomHostname));
  }

  if (config.pages.shop?.enabled !== false) {
    entries.push(entry(slug, "/shop", lastModified, 0.9, primaryCustomHostname));
  }

  const pages = ensureCustomPages(configRaw);
  for (const page of pages) {
    if (!page.enabled) continue;
    if (page.routeKind === "custom" && !includeEntity(configRaw, published, "page", page.id)) {
      continue;
    }
    if (page.routeKind === "builtin" && !includeEntity(configRaw, published, "page", page.id)) {
      continue;
    }
    if (page.slug === "blog") {
      const blog = ensureBlogSettings(configRaw);
      if (!blog.enabled) continue;
      entries.push(entry(slug, "/blog", lastModified, 0.7, primaryCustomHostname));
      continue;
    }
    const path = page.routeKind === "custom" ? `/pages/${page.slug}` : `/${page.slug}`;
    entries.push(
      entry(
        slug,
        path,
        lastModified,
        page.routeKind === "builtin" ? 0.5 : 0.6,
        primaryCustomHostname,
      ),
    );
  }

  const blogPosts = listVisibleBlogPosts(extractBlogPosts(configRaw), false);
  for (const post of blogPosts) {
    if (post.status !== "published") continue;
    if (!includeEntity(configRaw, published, "blog", post.id)) continue;
    entries.push(
      entry(
        slug,
        `/blog/${post.slug}`,
        new Date(post.updatedAt),
        0.6,
        primaryCustomHostname,
      ),
    );
  }

  for (const product of products) {
    if (!product.slug || isReservedProductSlug(product.slug)) continue;
    if (!includeEntity(configRaw, published, "product", product.id)) continue;
    entries.push(
      entry(
        slug,
        `/product/${product.slug}`,
        product.updatedAt,
        0.8,
        primaryCustomHostname,
      ),
    );
  }

  for (const cat of categories) {
    if (!includeEntity(configRaw, published, "category", cat.id)) continue;
    entries.push(
      entry(
        slug,
        `/shop?category=${encodeURIComponent(cat.slug)}`,
        lastModified,
        0.7,
        primaryCustomHostname,
      ),
    );
  }

  const menus = await prisma.menu.findMany({
    where: {
      standId: stand.id,
      isActive: true,
      showOnShop: true,
      kind: { in: [MenuKind.ALWAYS_AVAILABLE, MenuKind.PREORDER_DROP] },
    },
    select: { id: true, slug: true, updatedAt: true },
  });
  for (const menu of menus) {
    if (!includeEntity(configRaw, published, "menu", menu.id)) continue;
    entries.push(
      entry(slug, `/menu/${menu.slug}`, menu.updatedAt, 0.7, primaryCustomHostname),
    );
  }

  return entries;
}
