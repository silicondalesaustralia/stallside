import { prisma } from "@/lib/prisma";

export type StandStoreNav = {
  showShop: boolean;
  showPreOrders: boolean;
  showSubscriptions: boolean;
  showCart: boolean;
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
      _count: {
        select: {
          preOrderPages: { where: { isActive: true } },
          subscriptionOffers: {
            where: { isActive: true, stripePriceId: { not: null } },
          },
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
    };
  }

  const showShop = stand.cartMode !== "CUSTOMER_CHOICE";
  return {
    showShop,
    showPreOrders: stand._count.preOrderPages > 0,
    showSubscriptions: stand._count.subscriptionOffers > 0,
    showCart: showShop,
  };
}
