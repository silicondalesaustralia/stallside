import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MenuKind } from "@/generated/prisma/client";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import MenuView from "@/lib/storefront/views/MenuView";
import { menuViewMetadata } from "@/lib/storefront/views/menu-view-metadata";
import PreOrderPageView, { preOrderPageViewMetadata } from "@/lib/storefront/views/PreOrderPageView";

type Props = {
  params: Promise<{ slug: string; name: string }>;
  searchParams: Promise<{ draft?: string }>;
};

/** Pre-order drop menus take the slug first; otherwise a stand pre-order page. */
async function isDropMenu(slug: string, name: string, draft: boolean): Promise<boolean> {
  const ctx = await loadStorefrontPage(slug, draft);
  const menu = await prisma.menu.findFirst({
    where: {
      standId: ctx.stand.id,
      slug: decodeURIComponent(name).trim().toLowerCase(),
      kind: MenuKind.PREORDER_DROP,
      isActive: true,
      showOnShop: true,
    },
    select: { id: true },
  });
  return Boolean(menu);
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug, name } = await params;
  const draft = (await searchParams).draft === "1";
  if (await isDropMenu(slug, name, draft)) return menuViewMetadata({ slug, menuSlug: name, draft });
  return preOrderPageViewMetadata({ slug, pageSlug: name, draft });
}

export default async function StorefrontPreOrderPage({ params, searchParams }: Props) {
  const { slug, name } = await params;
  const draft = (await searchParams).draft === "1";
  if (await isDropMenu(slug, name, draft)) {
    return <MenuView slug={slug} menuSlug={name} draft={draft} preOrderRoute />;
  }
  return <PreOrderPageView slug={slug} pageSlug={name} draft={draft} />;
}
