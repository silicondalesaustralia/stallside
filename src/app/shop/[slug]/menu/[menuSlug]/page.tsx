import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MenuKind } from "@/generated/prisma/client";
import { mapPublicProduct } from "@/lib/public-product";
import { productLiveWhere } from "@/lib/product-visibility";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
import {
  buildStorefrontPageMetadata,
  seoConfigSource,
} from "@/lib/studio/resolve-seo-metadata";
import {
  isMenuDropOpen,
  menuScheduleLabel,
  shopMenusPath,
} from "@/lib/menu";
import { currentStorefrontBasePath } from "@/lib/tenancy/request-base-path";
import StorefrontPageShell from "@/components/storefront/StorefrontPageShell";
import StorefrontGoToCartBar from "@/components/storefront/StorefrontGoToCartBar";
import MenuOrder from "@/components/menu/MenuOrder";
import { resolveStudioPublicContext } from "@/lib/studio/public-context";
import { COMMERCE_MENU_KEY } from "@/lib/studio/commerce-pages";
import { withCommerceContext } from "@/lib/studio/commerce-context";
import { studioPageNodes } from "@/lib/studio/storage";
import StudioPublicSections from "@/lib/studio/public-render";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; menuSlug: string }>;
  searchParams: Promise<{ draft?: string }>;
}): Promise<Metadata> {
  const { slug, menuSlug } = await params;
  const sp = await searchParams;
  const draft = sp.draft === "1";
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
      select: { id: true, title: true, slug: true, description: true },
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
      path: menu ? `/menu/${encodeURIComponent(menu.slug)}` : undefined,
    });
  } catch {
    return { title: "Menu", robots: { index: false, follow: false } };
  }
}

export default async function ShopMenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; menuSlug: string }>;
  searchParams: Promise<{ draft?: string }>;
}) {
  const { slug, menuSlug } = await params;
  const sp = await searchParams;
  const draft = sp.draft === "1";
  const ctx = await loadStorefrontPage(slug, draft);
  const studioCtx = await resolveStudioPublicContext(ctx, draft);
  const basePath = await currentStorefrontBasePath(ctx.storefront.slug);
  const menuKey = decodeURIComponent(menuSlug).trim().toLowerCase();

  const menu = await prisma.menu.findFirst({
    where: {
      standId: ctx.stand.id,
      slug: menuKey,
      isActive: true,
      showOnShop: true,
    },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: { product: true },
      },
    },
  });
  if (!menu) notFound();

  if (
    menu.kind === MenuKind.PREORDER_DROP &&
    !isMenuDropOpen({ kind: menu.kind, orderByAt: menu.orderByAt })
  ) {
    notFound();
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: menu.items.map((i) => i.productId) },
      ...productLiveWhere,
    },
    include: {
      optionGroups: {
        orderBy: { sortOrder: "asc" },
        include: { choices: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  const byId = new Map(
    products.map((p) => [
      p.id,
      mapPublicProduct(p, {
        showExactStock:
          ctx.stand.showExactStock ||
          (menu.kind === MenuKind.PREORDER_DROP && menu.showExactStock),
        showPublicScarcity: ctx.stand.showPublicScarcity,
        timeZone: ctx.stand.timezone,
      }),
    ]),
  );
  const menuProducts = menu.items
    .map((i) => byId.get(i.productId))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  if (menuProducts.length === 0) notFound();

  const schedule = menuScheduleLabel({
    kind: menu.kind,
    collectionAt: menu.collectionAt,
    timeZone: ctx.stand.timezone,
  });

  const nodes =
    studioCtx.active
      ? studioPageNodes(studioCtx.studio, COMMERCE_MENU_KEY)
      : undefined;
  const metadata =
    studioCtx.active && nodes
      ? withCommerceContext(studioCtx.metadata, {
          kind: "menu",
          ownerId: ctx.owner.id,
          menu: {
            id: menu.id,
            slug: menu.slug,
            title: menu.title,
            description: menu.description,
            scheduleLabel: schedule,
            isPreOrderDrop: menu.kind === MenuKind.PREORDER_DROP,
            products: menuProducts,
          },
        })
      : undefined;

  return (
    <StorefrontPageShell ctx={ctx} draft={draft} activePage="menu">
      {nodes && metadata ? (
        <StudioPublicSections nodes={nodes} metadata={metadata} />
      ) : (
        <div className="storefront-page-content storefront-page-content--narrow">
          <Link
            href={shopMenusPath(ctx.storefront.slug, draft, basePath)}
            className="text-sm font-semibold text-[var(--leaf-dark)] underline"
          >
            ← Menus
          </Link>
          <h1
            className={`mt-4 text-3xl font-bold text-[var(--field)] ${studioCtx.active ? "studio-display" : "font-[family-name:var(--font-display)]"}`}
          >
            {menu.title}
          </h1>
          {schedule ? (
            <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-[var(--leaf-dark)]">
              {menu.kind === MenuKind.PREORDER_DROP ? "Pre-order drop" : "Menu"} ·{" "}
              {schedule}
            </p>
          ) : null}
          {menu.description ? (
            <p className="mt-3 text-lg text-[var(--muted)]">{menu.description}</p>
          ) : null}
          <MenuOrder
            standSlug={ctx.stand.slug}
            currency={ctx.stand.currency}
            products={menuProducts}
            catalogProducts={menuProducts}
            isPreOrderDrop={menu.kind === MenuKind.PREORDER_DROP}
          />
        </div>
      )}
      <StorefrontGoToCartBar standSlug={ctx.stand.slug} branding={ctx.branding} />
    </StorefrontPageShell>
  );
}
