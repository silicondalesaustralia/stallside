import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MenuKind } from "@/generated/prisma/client";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import { buildStorefrontPageMetadata, seoConfigSource } from "@/lib/studio/resolve-seo-metadata";

type ViewProps = { slug: string; menuSlug: string; draft: boolean; preOrderRoute: boolean };

export async function menuViewMetadata({ slug, menuSlug, draft }: Omit<ViewProps, "preOrderRoute">): Promise<Metadata> {
  try {
    const ctx = await loadStorefrontPage(slug, draft);
    const published = ctx.storefront.isPublished && !draft;
    const configRaw = seoConfigSource(
      ctx.storefront.draftConfig,
      ctx.storefront.publishedConfig,
      published,
    );
    const menu = await prisma.menu.findFirst({
      where: {
        standId: ctx.stand.id,
        slug: decodeURIComponent(menuSlug).trim().toLowerCase(),
        isActive: true,
        showOnShop: true,
      },
      select: { id: true, title: true, slug: true, description: true, kind: true },
    });
    return buildStorefrontPageMetadata({
      branding: ctx.branding,
      slug: ctx.storefront.slug,
      published,
      configRaw,
      entityType: "menu",
      entityId: menu?.id,
      defaults: {
        title: menu?.title ?? "Menu",
        description: menu?.description ?? menu?.title ?? "Menu",
      },
      path: menu
        ? `/${menu.kind === MenuKind.PREORDER_DROP ? "pre-orders" : "menus"}/${encodeURIComponent(menu.slug)}`
        : undefined,
    });
  } catch {
    return { title: "Menu", robots: { index: false, follow: false } };
  }
}
