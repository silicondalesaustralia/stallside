import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MenuKind } from "@/generated/prisma/client";
import { mapPublicProduct } from "@/lib/public-product";
import { publicStandBranding } from "@/lib/public-stand-branding";
import { standAccentStyle } from "@/lib/stand-brand";
import { productLiveWhere } from "@/lib/product-visibility";
import {
  isMenuDropOpen,
  menuScheduleLabel,
  standMenusPath,
} from "@/lib/menu";
import { standMenuDetailPath } from "@/lib/stand-seo";
import StandStoreHeader from "../../StandStoreHeader";
import StandGoToCartBar from "../../StandGoToCartBar";
import MenuOrder from "@/components/menu/MenuOrder";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ standSlug: string; menuSlug: string }>;
}): Promise<Metadata> {
  const { standSlug, menuSlug } = await params;
  const menu = await prisma.menu.findFirst({
    where: {
      slug: decodeURIComponent(menuSlug).trim().toLowerCase(),
      isActive: true,
      showOnStand: true,
      stand: {
        slug: decodeURIComponent(standSlug).trim().toLowerCase(),
        isActive: true,
      },
    },
    select: { title: true },
  });
  return { title: menu?.title ?? "Menu" };
}

export default async function PublicStandMenuPage({
  params,
}: {
  params: Promise<{ standSlug: string; menuSlug: string }>;
}) {
  const { standSlug, menuSlug } = await params;
  const standKey = decodeURIComponent(standSlug).trim().toLowerCase();
  const menuKey = decodeURIComponent(menuSlug).trim().toLowerCase();

  const stand = await prisma.stand.findUnique({
    where: { slug: standKey },
    include: {
      owner: true,
      products: {
        where: productLiveWhere,
        include: {
          optionGroups: {
            orderBy: { sortOrder: "asc" },
            include: { choices: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
  });
  if (!stand || !stand.isActive) notFound();

  const menu = await prisma.menu.findFirst({
    where: {
      standId: stand.id,
      slug: menuKey,
      isActive: true,
      showOnStand: true,
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

  const branded = publicStandBranding(stand, stand.owner);
  const byId = new Map(
    stand.products.map((p) => [
      p.id,
      mapPublicProduct(p, {
        showExactStock:
          stand.showExactStock ||
          (menu.kind === MenuKind.PREORDER_DROP && menu.showExactStock),
        showPublicScarcity: stand.showPublicScarcity,
        timeZone: stand.timezone,
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
    timeZone: stand.timezone,
  });

  return (
    <main
      className="mx-auto min-h-full w-full max-w-lg px-4 pb-24 pt-8"
      style={standAccentStyle(branded.accentColor, branded.secondaryColor)}
    >
      <StandStoreHeader
        standName={stand.name}
        standSlug={stand.slug}
        logoUrl={branded.logoUrl}
        locationLabel={stand.locationLabel}
        backHref={standMenusPath(stand.slug)}
        backLabel="← Menus"
      />
      <h1 className="mt-6 text-center font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
        {menu.title}
      </h1>
      {schedule ? (
        <p className="mt-2 text-center text-sm font-semibold uppercase tracking-wide text-[var(--leaf)]">
          {menu.kind === MenuKind.PREORDER_DROP ? "Pre-order drop" : "Menu"} ·{" "}
          {schedule}
        </p>
      ) : null}
      {menu.description ? (
        <p className="mt-3 text-lg leading-snug text-[var(--muted)]">
          {menu.description}
        </p>
      ) : null}

      <MenuOrder
        standSlug={stand.slug}
        currency={stand.currency}
        products={menuProducts}
        catalogProducts={[...byId.values()]}
        isPreOrderDrop={menu.kind === MenuKind.PREORDER_DROP}
      />
      <StandGoToCartBar standSlug={stand.slug} />
    </main>
  );
}
