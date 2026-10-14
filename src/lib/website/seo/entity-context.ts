import { ensureStorefront } from "@/lib/catalogue/storefront";
import { prisma } from "@/lib/prisma";
import { ensureCustomPages, findCustomPageById } from "@/lib/studio/custom-pages";
import { extractBlogPosts, extractBlogTopics, findBlogPostById } from "@/lib/studio/blog";
import { blogPostRelativePath, withDefaultBlogTopic } from "@/lib/studio/blog-topics";
import { extractStorefrontSeo, readEntitySeo } from "@/lib/studio/seo-settings";
import { homeSeoDefaults } from "@/lib/studio/resolve-seo-metadata";
import { resolveStorefrontBranding } from "@/lib/storefront/branding";
import { parseStorefrontConfig } from "@/lib/storefront/config";
import { pickWebsiteStand } from "@/lib/storefront/website-stand";
import { resolveDbEntityContext } from "./entity-context-db";
import type { EntitySeoContext } from "./entity-context-types";

export const BLOG_TOPIC_PAGE_PREFIX = "blog-topic-";

/** Label, address, defaults and saved overrides for one SEO entity key, or null if it no longer exists. */
export async function resolveEntitySeoContext(
  ownerId: string,
  businessName: string,
  entityKey: string,
): Promise<EntitySeoContext | null> {
  const owner = await prisma.owner.findUniqueOrThrow({
    where: { id: ownerId },
    include: {
      user: { select: { email: true, role: true } },
      stands: { orderBy: { createdAt: "asc" } },
    },
  });
  const storefront = await ensureStorefront(ownerId, businessName);
  const stand = pickWebsiteStand(owner.stands, storefront.draftConfig);
  if (!stand) return null;
  const config = parseStorefrontConfig(storefront.draftConfig);
  const branding = resolveStorefrontBranding({ owner, stand, storefront, config });
  const stored = readEntitySeo(extractStorefrontSeo(storefront.draftConfig), entityKey) ?? {};

  if (entityKey === "home") {
    return { label: "Home", pathLabel: "/", defaults: homeSeoDefaults(branding), settings: stored };
  }

  if (entityKey.startsWith(`page:${BLOG_TOPIC_PAGE_PREFIX}`)) {
    const topicId = entityKey.slice(`page:${BLOG_TOPIC_PAGE_PREFIX}`.length);
    const topic = withDefaultBlogTopic(extractBlogTopics(storefront.draftConfig)).find((t) => t.id === topicId);
    if (!topic) return null;
    return {
      label: topic.name,
      pathLabel: `/${topic.slug}`,
      defaults: { title: topic.name, description: `${topic.name} from ${branding.headline}` },
      settings: stored,
    };
  }

  if (entityKey.startsWith("page:")) {
    const page = findCustomPageById(ensureCustomPages(storefront.draftConfig), entityKey.slice(5));
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
      pathLabel: blogPostRelativePath(post, extractBlogTopics(storefront.draftConfig)),
      defaults: {
        title: post.title,
        description: post.excerpt || post.title,
        ogImageUrl: post.featuredImageUrl,
      },
      settings: stored,
    };
  }

  return resolveDbEntityContext(ownerId, entityKey, stored, branding.headline);
}
