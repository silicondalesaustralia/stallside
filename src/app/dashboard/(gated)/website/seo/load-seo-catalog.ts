import { prisma } from "@/lib/prisma";
import { ensureStorefront } from "@/lib/catalogue/storefront";
import { MenuKind, ProductChannelType } from "@/generated/prisma/client";
import { primaryStandIdForOwner } from "@/lib/catalogue/channels";
import { extractStorefrontSeo } from "@/lib/studio/seo-settings";
import { ensureCustomPages } from "@/lib/studio/custom-pages";
import { extractBlogPosts, extractBlogTopics } from "@/lib/studio/blog";
import { blogPostRelativePath } from "@/lib/studio/blog-topics";

export async function loadSeoCatalog(ownerId: string, businessName: string) {
  const storefront = await ensureStorefront(ownerId, businessName);
  const standId = await primaryStandIdForOwner(ownerId);
  const seo = extractStorefrontSeo(storefront.draftConfig);
  const pages = ensureCustomPages(storefront.draftConfig);
  const topics = extractBlogTopics(storefront.draftConfig);
  const blogPosts = extractBlogPosts(storefront.draftConfig).map((post) => ({
    ...post,
    path: blogPostRelativePath(post, topics),
  }));

  const [products, categories, menuRows] = await Promise.all([
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
          select: { id: true, title: true, slug: true, description: true, kind: true },
        })
      : Promise.resolve([]),
  ]);

  const menus = menuRows.map((m) => ({
    ...m,
    path: `/${m.kind === MenuKind.PREORDER_DROP ? "pre-orders" : "menus"}/${m.slug}`,
  }));

  return { storefront, seo, pages, blogPosts, products, categories, menus };
}
