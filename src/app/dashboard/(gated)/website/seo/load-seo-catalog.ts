import { prisma } from "@/lib/prisma";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { ProductChannelType } from "@/generated/prisma/client";
import { primaryStandIdForOwner } from "@/lib/catalogue/channels";
import { extractStorefrontSeo } from "@/lib/studio/seo-settings";
import { ensureCustomPages } from "@/lib/studio/custom-pages";
import { extractBlogPosts } from "@/lib/studio/blog";

export async function loadSeoCatalog(ownerId: string, businessName: string) {
  const storefront = await ensureStorefront(ownerId, businessName);
  const standId = await primaryStandIdForOwner(ownerId);
  const seo = extractStorefrontSeo(storefront.draftConfig);
  const pages = ensureCustomPages(storefront.draftConfig);
  const blogPosts = extractBlogPosts(storefront.draftConfig);

  const [products, categories, menus] = await Promise.all([
    standId
      ? prisma.product.findMany({
          where: {
            ownerId,
            isArchived: false,
            channels: {
              some: {
                standId,
                channelType: ProductChannelType.ONLINE,
                isEnabled: true,
              },
            },
          },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: { id: true, name: true, slug: true, seoTitle: true, seoDescription: true },
        })
      : Promise.resolve([]),
    prisma.category.findMany({
      where: { ownerId, isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, title: true, slug: true },
    }),
    standId
      ? prisma.menu.findMany({
          where: { standId, isActive: true, showOnShop: true },
          orderBy: { title: "asc" },
          select: { id: true, title: true, slug: true, description: true },
        })
      : Promise.resolve([]),
  ]);

  return { storefront, seo, pages, blogPosts, products, categories, menus };
}
