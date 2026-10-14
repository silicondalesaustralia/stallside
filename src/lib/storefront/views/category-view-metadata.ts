import type { Metadata } from "next";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import { buildStorefrontPageMetadata, seoConfigSource } from "@/lib/studio/resolve-seo-metadata";
import { prisma } from "@/lib/prisma";

type ViewProps = { slug: string; categorySlug: string; draft: boolean };

export async function categoryViewMetadata({ slug, categorySlug, draft }: ViewProps): Promise<Metadata> {
  const catSlug = decodeURIComponent(categorySlug).trim().toLowerCase();
  try {
    const ctx = await loadStorefrontPage(slug, draft);
    const published = ctx.storefront.isPublished && !draft;
    const configRaw = seoConfigSource(
      ctx.storefront.draftConfig,
      ctx.storefront.publishedConfig,
      published,
    );
    const cat =
      ctx.categories.find((c) => c.slug === catSlug) ??
      (await prisma.category.findFirst({
        where: { ownerId: ctx.owner.id, slug: catSlug, isActive: true },
        select: { id: true, title: true, slug: true, description: true },
      }));
    if (!cat) return { title: "Shop", robots: { index: false, follow: false } };
    return buildStorefrontPageMetadata({
      branding: ctx.branding,
      slug: ctx.storefront.slug,
      published,
      configRaw,
      entityType: "category",
      entityId: cat.id,
      defaults: {
        title: cat.title,
        description: cat.description ?? `${cat.title} at ${ctx.branding.headline}`,
      },
      path: `/${encodeURIComponent(cat.slug)}`,
    });
  } catch {
    return { title: "Shop", robots: { index: false, follow: false } };
  }
}
