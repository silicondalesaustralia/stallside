import { prisma } from "@/lib/prisma";
import { MenuKind } from "@/generated/prisma/client";
import { mapPublicProduct } from "@/lib/public-product";
import { productLiveWhere } from "@/lib/product-visibility";

type MenuStand = { showExactStock: boolean; showPublicScarcity: boolean; timezone: string };
type MenuForProducts = {
  kind: MenuKind;
  showExactStock: boolean;
  items: { productId: string }[];
};

/** Live products on a menu, in menu order, mapped for the public storefront. */
export async function loadMenuViewProducts(
  stand: MenuStand,
  menu: MenuForProducts,
  categorySlugs?: ReadonlyMap<string, string | null>,
) {
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
      mapPublicProduct({ ...p, mainCategorySlug: categorySlugs?.get(p.id) ?? null }, {
        showExactStock: stand.showExactStock || (menu.kind === MenuKind.PREORDER_DROP && menu.showExactStock),
        showPublicScarcity: stand.showPublicScarcity,
        timeZone: stand.timezone,
      }),
    ]),
  );
  return menu.items
    .map((i) => byId.get(i.productId))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
}
