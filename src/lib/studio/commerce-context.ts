import type { StorefrontContext } from "@/lib/catalogue/storefront";
import { mapPublicProduct } from "@/lib/public-product";
import { MenuKind } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { menuScheduleLabel } from "@/lib/menu";
import { productLiveWhere } from "@/lib/product-visibility";
import type {
  CommercePageKind,
  StudioCommerceContext,
} from "./commerce-pages";
import type { StudioMetadata } from "./types";

function mapStandProducts(ctx: NonNullable<StorefrontContext>) {
  return ctx.products.map((p) =>
    mapPublicProduct(p, {
      showExactStock: ctx.stand.showExactStock,
      showPublicScarcity: ctx.stand.showPublicScarcity,
      timeZone: ctx.stand.timezone,
    }),
  );
}

export function withCommerceContext(
  metadata: StudioMetadata,
  commerceContext: StudioCommerceContext | undefined,
): StudioMetadata {
  if (!commerceContext) return metadata;
  return { ...metadata, commerceContext };
}

export async function buildSampleCommerceContext(
  ctx: NonNullable<StorefrontContext>,
  kind: CommercePageKind,
): Promise<StudioCommerceContext> {
  const catalog = mapStandProducts(ctx);
  const base: StudioCommerceContext = {
    kind,
    ownerId: ctx.owner.id,
    catalogProducts: catalog,
  };

  if (kind === "shop") return base;

  if (kind === "category") {
    const cat = ctx.categories[0];
    return {
      ...base,
      category: cat
        ? {
            id: cat.id,
            slug: cat.slug,
            title: cat.title,
            description: cat.description,
            imageUrl: cat.imageUrl,
          }
        : undefined,
    };
  }

  if (kind === "product") {
    return {
      ...base,
      product: catalog[0],
      catalogProducts: catalog,
    };
  }

  const menu = await prisma.menu.findFirst({
    where: {
      standId: ctx.stand.id,
      isActive: true,
      showOnShop: true,
    },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: { product: true },
      },
    },
    orderBy: { title: "asc" },
  });

  if (!menu) {
    return { ...base, menu: undefined };
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

  return {
    ...base,
    menu: {
      id: menu.id,
      slug: menu.slug,
      title: menu.title,
      description: menu.description,
      scheduleLabel: menuScheduleLabel({
        kind: menu.kind,
        collectionAt: menu.collectionAt,
        timeZone: ctx.stand.timezone,
      }),
      isPreOrderDrop: menu.kind === MenuKind.PREORDER_DROP,
      products: menuProducts,
    },
  };
}
