import { prisma } from "@/lib/prisma";
import { loadStandShopCategories } from "@/lib/categories/public-categories";

export type StandStoreNav = {
  showShop: boolean;
  showPreOrders: boolean;
  showSubscriptions: boolean;
  showCart: boolean;
  categories: { slug: string; title: string }[];
};

/** Public header links for a stand — only channels that exist / apply. */
export async function resolveStandStoreNav(
  standSlug: string,
): Promise<StandStoreNav> {
  const slug = standSlug.trim().toLowerCase();
  const stand = await prisma.stand.findUnique({
    where: { slug },
    select: {
      id: true,
      isActive: true,
      cartMode: true,
      showSubscriptionsOnStand: true,
      _count: {
        select: {
          preOrderPages: { where: { isActive: true } },
          subscriptionOffers: { where: { isActive: true } },
        },
      },
    },
  });

  if (!stand || !stand.isActive) {
    return {
      showShop: false,
      showPreOrders: false,
      showSubscriptions: false,
      showCart: false,
      categories: [],
    };
  }

  const showShop = stand.cartMode !== "CUSTOMER_CHOICE";
  const categories = showShop ? await loadStandShopCategories(slug) : [];
  return {
    showShop,
    categories: categories.map((c) => ({ slug: c.slug, title: c.title })),
    showPreOrders: stand._count.preOrderPages > 0,
    showSubscriptions:
      stand.showSubscriptionsOnStand && stand._count.subscriptionOffers > 0,
    showCart: showShop,
  };
}
