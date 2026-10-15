import { prisma } from "@/lib/prisma";
import type { EntitySeoSettings } from "@/lib/studio/seo-settings";
import type { EntitySeoContext } from "./entity-context-types";
import { pickMainCategory } from "@/lib/catalogue/main-category";

/** SEO context for entities stored in their own tables (products, categories, menus, offers). */
export async function resolveDbEntityContext(
  ownerId: string,
  entityKey: string,
  stored: EntitySeoSettings,
  siteName: string,
): Promise<EntitySeoContext | null> {
  const [type, id] = [entityKey.slice(0, entityKey.indexOf(":")), entityKey.slice(entityKey.indexOf(":") + 1)];

  if (type === "product") {
    const product = await prisma.product.findFirst({
      where: { id, ownerId },
      select: {
        name: true, slug: true, description: true, seoTitle: true, seoDescription: true, imageUrl: true,
        primaryCategoryId: true,
        categoryLinks: {
          where: { category: { isActive: true } },
          select: { category: { select: { id: true, slug: true, showOnWebsite: true, sortOrder: true, title: true } } },
        },
      },
    });
    if (!product) return null;
    const linked = product.categoryLinks
      .map((l) => l.category)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
    const main = pickMainCategory(product.primaryCategoryId, new Set(linked.map((c) => c.id)), linked);
    const prefix = main ? `/${main.slug}/` : "/products/";
    return {
      label: product.name,
      pathLabel: `${prefix}${product.slug}`,
      url: { prefix, slug: product.slug },
      defaults: {
        title: product.seoTitle ?? product.name,
        description: product.seoDescription ?? product.description ?? product.name,
        ogImageUrl: product.imageUrl,
      },
      settings: stored,
    };
  }

  if (type === "category") {
    const cat = await prisma.category.findFirst({
      where: { id, ownerId },
      select: { title: true, slug: true, description: true, imageUrl: true },
    });
    if (!cat) return null;
    return {
      label: cat.title,
      pathLabel: `/${cat.slug}`,
      url: { prefix: "/", slug: cat.slug },
      defaults: {
        title: cat.title,
        description: cat.description ?? `${cat.title} at ${siteName}`,
        ogImageUrl: cat.imageUrl,
      },
      settings: stored,
    };
  }

  if (type === "menu") {
    const preOrder = await prisma.preOrderPage.findFirst({
      where: { id, ownerId },
      select: { title: true, slug: true, description: true, imageUrl: true },
    });
    if (preOrder) {
      return {
        label: preOrder.title,
        pathLabel: `/pre-orders/${preOrder.slug}`,
        url: { prefix: "/pre-orders/", slug: preOrder.slug },
        defaults: {
          title: preOrder.title,
          description: preOrder.description ?? preOrder.title,
          ogImageUrl: preOrder.imageUrl,
        },
        settings: stored,
      };
    }
    const menu = await prisma.menu.findFirst({
      where: { id, ownerId },
      select: { title: true, slug: true, description: true, kind: true },
    });
    if (!menu) return null;
    const prefix = `/${menu.kind === "PREORDER_DROP" ? "pre-orders" : "menus"}/`;
    return {
      label: menu.title,
      pathLabel: `${prefix}${menu.slug}`,
      url: { prefix, slug: menu.slug },
      defaults: { title: menu.title, description: menu.description ?? menu.title },
      settings: stored,
    };
  }

  if (type === "subscription") {
    const offer = await prisma.subscriptionOffer.findFirst({
      where: { id, ownerId },
      select: { title: true, slug: true, description: true, imageUrl: true },
    });
    if (!offer) return null;
    return {
      label: offer.title,
      pathLabel: `/subscriptions/${offer.slug}`,
      url: { prefix: "/subscriptions/", slug: offer.slug },
      defaults: {
        title: offer.title,
        description: offer.description?.trim() || `${offer.title} from ${siteName}`,
        ogImageUrl: offer.imageUrl,
      },
      settings: stored,
    };
  }

  return null;
}
