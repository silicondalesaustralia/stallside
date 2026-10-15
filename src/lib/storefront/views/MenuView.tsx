import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MenuKind } from "@/generated/prisma/client";
import { loadStorefrontPage } from "@/lib/storefront/page-loader";
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
import { redirectWithinStorefront } from "@/lib/storefront/clean-redirect";
import { loadMenuViewProducts } from "./menu-view-products";
import { categorySlugsById } from "@/lib/catalogue/main-category";
import { menuPageSeo } from "@/lib/seo/menu-page-seo";

type ViewProps = { slug: string; menuSlug: string; draft: boolean; preOrderRoute: boolean };


/** A menu at `/menus/{menu}` or a pre-order drop at `/pre-orders/{menu}`; the wrong prefix redirects. */
export default async function MenuView({ slug, menuSlug, draft, preOrderRoute }: ViewProps) {
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
  const isDrop = menu.kind === MenuKind.PREORDER_DROP;
  if (isDrop !== preOrderRoute) {
    await redirectWithinStorefront(ctx.storefront.slug, `/${isDrop ? "pre-orders" : "menus"}/${menu.slug}`, draft);
  }

  if (
    menu.kind === MenuKind.PREORDER_DROP &&
    !isMenuDropOpen({ kind: menu.kind, orderByAt: menu.orderByAt })
  ) {
    notFound();
  }

  const menuProducts = await loadMenuViewProducts(ctx.stand, menu, categorySlugsById(ctx.products));
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
    <StorefrontPageShell
      ctx={ctx}
      draft={draft}
      activePage="menu"
      seo={menuPageSeo(ctx, {
        path: `/${isDrop ? "pre-orders" : "menus"}/${encodeURIComponent(menu.slug)}`,
        name: menu.title,
        description: menu.description,
        products: menuProducts,
        isPreOrder: isDrop,
      })}
    >
      {nodes && metadata ? (
        <StudioPublicSections nodes={nodes} metadata={metadata} />
      ) : (
        <div className="storefront-page-content storefront-page-content--narrow">
          <Link
            href={shopMenusPath(ctx.storefront.slug, draft, basePath)}
            className="text-sm font-semibold text-[var(--site-link,var(--leaf-dark))] underline"
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
