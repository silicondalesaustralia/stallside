import type { StorefrontContext } from "@/lib/catalogue/storefront";
import { prisma } from "@/lib/prisma";
import { ensureCustomPages } from "@/lib/studio/custom-pages";
import { extractBlogTopics } from "@/lib/studio/blog";
import { withDefaultBlogTopic } from "@/lib/studio/blog-topics";
import { blogConfigSource } from "@/lib/studio/load-blog";
import { resolveSiteSlugOwner, type SiteSlugOwner } from "./site-slugs";

/** Pages, product categories and blog categories competing for `/{slug}` on a site. */
export async function siteSlugOwnersFromConfig(ownerId: string, configRaw: unknown): Promise<SiteSlugOwner[]> {
  const pages = ensureCustomPages(configRaw).filter((p) => p.enabled);
  const categories = await prisma.category.findMany({
    where: { ownerId, isActive: true },
    select: { id: true, slug: true, title: true },
  });
  return [
    ...pages
      .filter((p) => p.routeKind === "custom")
      .map((p) => ({ kind: "page" as const, id: p.id, slug: p.slug, label: p.title })),
    ...categories.map((c) => ({ kind: "category" as const, id: c.id, slug: c.slug, label: c.title })),
    ...withDefaultBlogTopic(extractBlogTopics(configRaw)).map((t) => ({
      kind: "blogCategory" as const,
      id: t.id,
      slug: t.slug,
      label: t.name,
    })),
  ];
}

/** What `/{slug}` shows on this storefront (live or draft content), or null. */
export async function resolveStorefrontSlug(
  ctx: NonNullable<StorefrontContext>,
  slug: string,
  draft: boolean,
): Promise<SiteSlugOwner | null> {
  const owners = await siteSlugOwnersFromConfig(ctx.owner.id, blogConfigSource(ctx, draft));
  return resolveSiteSlugOwner(decodeURIComponent(slug), owners);
}
