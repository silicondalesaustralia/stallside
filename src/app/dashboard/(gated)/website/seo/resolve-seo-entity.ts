import { ensureStorefront } from "@/lib/catalogue/storefront";
import { prisma } from "@/lib/prisma";
import { ensureCustomPages, findCustomPageById } from "@/lib/studio/custom-pages";
import { extractBlogPosts, findBlogPostById } from "@/lib/studio/blog";
import {
  extractStorefrontSeo,
  readEntitySeo,
  type EntitySeoSettings,
} from "@/lib/studio/seo-settings";
import { homeSeoDefaults } from "@/lib/studio/resolve-seo-metadata";
import { resolveStorefrontBranding } from "@/lib/storefront/branding";
import { parseStorefrontConfig } from "@/lib/storefront/config";

export type EntityContext = {
  label: string;
  pathLabel: string;
  defaults: { title: string; description: string };
  settings: EntitySeoSettings;
};

export async function resolveEntityContext(
  ownerId: string,
  businessName: string,
  entityKey: string,
): Promise<EntityContext | null> {
  const owner = await prisma.owner.findUniqueOrThrow({
    where: { id: ownerId },
    include: {
      user: { select: { email: true, role: true } },
      stands: { orderBy: { createdAt: "asc" }, take: 1 },
    },
  });
  const storefront = await ensureStorefront(ownerId, businessName);
  const stand = owner.stands[0];
  if (!stand) return null;
  const config = parseStorefrontConfig(storefront.draftConfig);
  const branding = resolveStorefrontBranding({ owner, stand, storefront, config });
  const seo = extractStorefrontSeo(storefront.draftConfig);
  const stored = readEntitySeo(seo, entityKey) ?? {};

  if (entityKey === "home") {
    const defaults = homeSeoDefaults(branding);
    return {
      label: "Home",
      pathLabel: "/",
      defaults: { title: defaults.title, description: defaults.description },
      settings: stored,
    };
  }

  if (entityKey.startsWith("page:")) {
    const page = findCustomPageById(
      ensureCustomPages(storefront.draftConfig),
      entityKey.slice(5),
    );
    if (!page) return null;
    return {
      label: page.title,
      pathLabel: `/${page.slug}`,
      defaults: { title: page.title, description: page.navLabel || page.title },
      settings: stored,
    };
  }

  if (entityKey.startsWith("blog:")) {
    const post = findBlogPostById(extractBlogPosts(storefront.draftConfig), entityKey.slice(5));
    if (!post) return null;
    return {
      label: post.title,
      pathLabel: `/blog/${post.slug}`,
      defaults: {
        title: post.title,
        description: post.excerpt || post.title,
      },
      settings: stored,
    };
  }

  if (entityKey.startsWith("product:")) {
    const product = await prisma.product.findFirst({
      where: { id: entityKey.slice(8), ownerId },
      select: {
        name: true,
        slug: true,
        description: true,
        seoTitle: true,
        seoDescription: true,
        imageUrl: true,
      },
    });
    if (!product) return null;
    return {
      label: product.name,
      pathLabel: `/products/${product.slug}`,
      defaults: {
        title: product.seoTitle ?? product.name,
        description: product.seoDescription ?? product.description ?? product.name,
      },
      settings: {
        ...stored,
        ogImageUrl: stored.ogImageUrl ?? product.imageUrl ?? undefined,
      },
    };
  }

  if (entityKey.startsWith("category:")) {
    const cat = await prisma.category.findFirst({
      where: { id: entityKey.slice(9), ownerId },
      select: { title: true, slug: true, description: true },
    });
    if (!cat) return null;
    return {
      label: cat.title,
      pathLabel: `/shop/${cat.slug}`,
      defaults: {
        title: cat.title,
        description: cat.description ?? `${cat.title} at ${branding.headline}`,
      },
      settings: stored,
    };
  }

  if (entityKey.startsWith("menu:")) {
    const menu = await prisma.menu.findFirst({
      where: { id: entityKey.slice(5), ownerId },
      select: { title: true, slug: true, description: true },
    });
    if (!menu) return null;
    return {
      label: menu.title,
      pathLabel: `/menu/${menu.slug}`,
      defaults: {
        title: menu.title,
        description: menu.description ?? menu.title,
      },
      settings: stored,
    };
  }

  return null;
}
